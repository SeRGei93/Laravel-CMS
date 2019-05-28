<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateTagsTable extends Migration
{
	public function up()
	{
		Schema::create('tagging_tagged', function(Blueprint $table) {
			$table->increments('id');
			if(config('tagging.primary_keys_type') === 'string') {
				$table->string('taggable_id', 36)->index();
			} else {
				$table->integer('taggable_id')->unsigned()->index();
			}
			$table->string('taggable_type', 125)->index();
			$table->string('tag_name', 125);
			$table->string('tag_slug', 125)->index();
		});

		Schema::create('tagging_tags', function(Blueprint $table) {
			$table->increments('id');
			$table->string('slug', 125)->index();
			$table->string('name', 125);
			$table->boolean('suggest')->default(false);
			$table->integer('count')->unsigned()->default(0); // count of how many times this tag was used
		});

		Schema::create('tagging_tag_groups', function(Blueprint $table) {
			$table->increments('id');
			$table->string('slug', 125)->index();
			$table->string('name', 125);
		});

		Schema::table('tagging_tags', function ($table) {
			$table->integer('tag_group_id')->unsigned()->nullable()->after('id');
			$table->foreign('tag_group_id')->references('id')->on('tagging_tag_groups');
		});
	}

	public function down()
	{
		Schema::disableForeignKeyConstraints();
		Schema::table('tagging_tags', function ($table) {
			$table->dropForeign('tagging_tags_tag_group_id_foreign');
			$table->dropColumn('tag_group_id');
		});
		Schema::drop('tagging_tag_groups');
		Schema::drop('tagging_tags');
		Schema::drop('tagging_tagged');
	}
}
