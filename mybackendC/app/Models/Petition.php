<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Petition extends Model
{
    protected $fillable = ['title', 'description', 'user_id', 'image', 'status', 'signers'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
