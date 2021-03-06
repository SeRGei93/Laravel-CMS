<?php

namespace App\Services;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Str;

class BaseMigration extends Migration
{
    // models of migration tables
    public $model_slugs = [];

    // model of migration table
    public $model_slug;

    // if table exist it will update or rebuild
    public $update = true;

    // create backup before update or rebuild
    public $backup = false;

    private $_migrations = [];

    public function __construct()
    {
        if ($this->model_slugs === []){
            $this->model_slugs = [$this->model_slug];
            if ($this->model_slug === null){
                $this->model_slugs = config('cms.migration');
            }
        }
        foreach($this->model_slugs as $model_slug){
            $model_name = Str::studly($model_slug);
            $model_namespace = config('cms.config.models_namespace') . $model_name;
            $model_repository = new $model_namespace();
            $model_columns = $model_repository->getColumns();
            $model_table = $model_repository->getTable();
            $this->_migrations[] = (object) [
                'model_slug' => $model_slug,
                'model_name' => $model_name,
                'model_namespace' => $model_namespace,
                'model_repository' => $model_repository,
                'model_columns' => $model_columns,
                'model_table' => $model_table,
            ];
        }
    }

    public function up()
    {
        Schema::defaultStringLength(191); // if you are using mariaDB you need this.
        foreach($this->_migrations as $_migration)
        {
            if(Schema::hasTable($_migration->model_table) === false){
                echo 'creating ' . $_migration->model_table;
                $this->_createMigration($_migration->model_table, $_migration->model_columns);
            }else{
                if($this->backup === true){
                    echo 'backuping ' . $_migration->model_table;
                    $this->_createBackupTable($_migration->model_table, $_migration->model_repository);
                }
                if($this->update === true){
                    echo 'updating ' . $_migration->model_table;
                    $this->_updateMigration($_migration->model_table, $_migration->model_columns);
                }else{
                    echo 'rebuilding ' . $_migration->model_table;
                    $this->_dropTable($_migration->model_table);
                    $this->_createMigration($_migration->model_table, $_migration->model_columns);
                }
            }
            echo "\n";
        }
    }

    public function down()
    {
        $reversed_migrations = collect($this->_migrations)->reverse();
        foreach($reversed_migrations as $_migration)
        {
            $this->_dropTable($_migration->model_table);
        }
    }

    private function _dropTable($model_table)
    {
        Schema::dropIfExists($model_table);
    }

    private function _createMigration($model_table, $model_columns)
    {
        Schema::create($model_table, function (Blueprint $table) use ($model_columns) {
            $table->bigIncrements('id');
            foreach($model_columns as $column){
                $name = $column['name'];
                $type = isset($column['type']) ? $column['type'] : '';
                $database = isset($column['database']) ? $column['database'] : '';
                $relation = isset($column['relation']) ? $column['relation'] : '';
                if($database === 'none'){
                    continue;
                }
                $table->{$type}($name)->{$database}(true);
                if($relation){
                    $table->foreign($name)->references('id')->on($relation);
                }
            }
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function _updateMigration($model_table, $model_columns)
    {
        $old_database_columns = Schema::getColumnListing($model_table);
        $extra_columns = ['id', 'created_at', 'updated_at', 'deleted_at'];
        $drop_columns = $old_database_columns;
        $add_columns = collect($model_columns)->where('database', '!=', 'none')->toArray();
        foreach($old_database_columns as $column_key => $old_database_column){
            $array_index = array_search($old_database_column, collect($model_columns)->pluck('name')->toArray(), true);
            if($array_index !== false){
                unset($drop_columns[$column_key]);
                unset($add_columns[$array_index]);
            }
            if(array_search($old_database_column, $extra_columns, true) !== false){
                unset($drop_columns[$column_key]);
            }
        }
        echo ' droping ' . count($drop_columns) . ' columns. ';
        echo 'adding ' . count($add_columns) . ' columns.';
        Schema::table($model_table, function (Blueprint $table) use ($add_columns, $drop_columns) {
            foreach($drop_columns as $drop_column){
                if(strpos($drop_column, '_id') !== false){
                    $table->dropForeign([$drop_column]);
                }
                $table->dropColumn($drop_column);
            }
            foreach($add_columns as $column){
                $name = $column['name'];
                $type = $column['type'];
                $database = isset($column['database']) ? $column['database'] : '';
                $relation = isset($column['relation']) ? $column['relation'] : '';
                if($database === 'none'){
                    continue;
                }
                $table->{$type}($name)->{$database}(true)->after('id');
                if($relation){
                    $table->foreign($name)->references('id')->on($relation);
                }
            }
        });
    }

    private function _createBackupTable($model_table, $model_repository)
    {
        $model_repository_list = $model_repository->withTrashed()
            ->get()
            ->makeVisible('deleted_at')
            ->toArray();
        $backup_table_name = $model_table . '_backup_' . strtotime('now');
        Schema::create($backup_table_name, function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('row_data')->nullabe();
            $table->timestamps();
            $table->softDeletes();
        });
        foreach($model_repository_list as $model_repository_item){
            \DB::table($backup_table_name)->insert([
                'id' => $model_repository_item['id'],
                'created_at' => $model_repository_item['created_at'],
                'updated_at' => $model_repository_item['updated_at'],
                'deleted_at' => $model_repository_item['deleted_at'],
                'row_data' => serialize($model_repository_item),
            ]);
        }
    }
}
