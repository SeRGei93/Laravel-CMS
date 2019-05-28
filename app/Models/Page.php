<?php

namespace App\Models;

use Auth;
use Conner\Tagging\Taggable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Page extends Model
{
	use SoftDeletes;
    use Taggable;

    public $guarded = [];

    // public $fillable = [
    //     'id', // integer - required -
    //     'title', // string - required - unique:blogs,title - min:10|max:60
    //     'url', // string - required - max:80 - lowercase - alphabetic
    //     'short_content', // string - nullable -
    //     'content', // text - required - find h1 1 done va != title - h2 -
    //     'creator_id', // integer - required
    //     'editor_id', // integer - required
    //     'published', // boolean - default true -
    //     'google_index', // boolean - default true -
    //     'meta_description', // string - required - min:70|max:320
    //     'keywords', // string - nullable
    //     'meta_image', // string - nullable ?!?!
    //     'canonical_url', // string - nullable - url bashe
    //     'created_at',
    //     'updated_at',
    //     'deleted_at',
    // ];

    // public $fields = [
    //     ['name' => 'id', 'type' => 'increments', 'rule' => 'required'],
    //     // Url should be unique, contain lowercase characters and numbers and -
    //     ['name' => 'url', 'type' => 'string', 'rule' => 'required|max:80|regex:/^[a-z0-9-_]+$/|unique:blogs,url'],
    //     // Title should be unique, minimum 10 and maximum 60 characters.
    //     ['name' => 'title', 'type' => 'string', 'rule' => 'required|max:60|min:10|unique:blogs,title'],
    //     // Short content will show in lists instead of content.
    //     ['name' => 'short_content', 'type' => 'string', 'rule' => 'nullable|max:191'],
    //     ['name' => 'content', 'type' => 'text', 'rule' => 'required|seo_header'],
    //     // Meta description should have minimum 70 and maximum 191 characters.
    //     ['name' => 'meta_description', 'type' => 'string', 'rule' => 'required|max:191|min:70'],
    //     ['name' => 'keywords', 'type' => 'string', 'rule' => 'nullable|max:191'],
    //     ['name' => 'meta_image', 'type' => 'string', 'rule' => 'nullable|max:191|url'],
    //     ['name' => 'published', 'type' => 'boolean', 'rule' => ''],
    //     // Google will index this page
    //     ['name' => 'google_index', 'type' => 'boolean', 'rule' => ''],
    //     // Canonical url just used for duplicate contents, they should have same canonical url
    //     ['name' => 'canonical_url', 'type' => 'string', 'rule' => 'nullable|max:191|url'],
    //     ['name' => 'creator_id', 'type' => 'integer', 'rule' => 'required'],
    //     ['name' => 'editor_id', 'type' => 'integer', 'rule' => 'required'],
    //     ['name' => 'created_at', 'type' => 'datetime', 'rule' => 'required'],
    //     ['name' => 'updated_at', 'type' => 'datetime', 'rule' => 'required'],
    //     ['name' => 'deleted_at', 'type' => 'datetime', 'rule' => 'nullable'],
    // ];

    public $columns = [
        [
            'name' => 'title1',
            'type' => 'string',
            'rule' => 'unique',
            'validation' => 'required|max:190|min:10|unique:pages,title1,',
            // 'help' => 'Title should be unique, minimum 10 and maximum 60 characters.',
        ],
        [
            'name' => 'url2',
            'type' => 'integer',
            'rule' => 'unsigned',
            'validation' => 'required|numeric|max:40',
            'help' => 'required|numeric|max:40',
        ],
        [
            'name' => 'short_content3',
            'type' => 'integer',
            'rule' => 'nullable',
            'validation' => 'required|digits:5',
            'help' => 'required|digits:5',
        ],
        [
            'name' => 'content',
            'type' => 'text',
            'validation' => 'required',
            'table' => true,
        ],
        [
            'name' => 'meta_description5',
            'type' => 'string',
            'validation' => 'required|exists:users,id',
            'help' => 'required|exists:users,id',
            'table' => true,
        ],
        [
            'name' => 'keywords6',
            'type' => 'string',
            'rule' => 'nullable',
            'validation' => 'nullable|max:191',
            'help' => 'Its not important for google anymore',
        ],
        [
            'name' => 'meta_image7',
            'type' => 'string',
            'rule' => 'nullable',
            'validation' => 'nullable|max:191|url',
            'help' => 'Meta image shows when this page is shared in social networks.',
        ],
        [
            'name' => 'published',
            'type' => 'boolean',
            'rule' => 'default',
        ],
        [
            'name' => 'google_index',
            'type' => 'boolean',
            'rule' => 'default',
            'help' => 'Google will index this page.',
        ],
        [
            'name' => 'canonical_url10',
            'type' => 'string',
            'rule' => 'nullable',
            'validation' => 'nullable|max:191|url',
            'help' => 'Canonical url just used for seo redirect duplicate contents.',
        ],
        [
            'name' => 'creator_id',
            'relation' => 'users',
        ],
        [
            'name' => 'editor_id',
            'relation' => 'users',
        ],
    ];

    protected $hidden = [
    ];

    public function getColumns()
    {
        return $this->columns;
    }

    public function editor()
    {
        return $this->belongsTo('App\Models\User', 'editor_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo('App\Models\User', 'creator_id', 'id');
    }

    // public function category()
    // {
    //     return $this->belongsTo('App\Models\Category', 'category_id', 'id');
    // }

    public function scopeActive($query)
    {
        return $query->where('published', true);
    }

    public function scopeMine($query)
    {
        return $query->where('editor_id', \Auth::id());
    }

    public function scopeFindTag($tags)
    {
        return $this->withAnyTags(['tag 1', 'tag 2'])->get();
    }

    public static function getFillables()
    {
    	return (new self())->fillable;
    }

    public static function boot()
    {
        parent::boot();

        self::creating(function($model){
            $model->published = $model->published ? 1 : 0;
            $model->google_index = $model->google_index ? 1 : 0;
            $model->creator_id = Auth::id() ?: 1;
            $model->editor_id = Auth::id() ?: 1;
        });

        self::updating(function($model){
            $model->published = $model->published ? 1 : 0;
            $model->google_index = $model->google_index ? 1 : 0;
            $model->editor_id = Auth::id() ?: 1;
        });
    }
}
