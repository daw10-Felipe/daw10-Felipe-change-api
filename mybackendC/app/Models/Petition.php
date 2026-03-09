<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Petition extends Model
{
    protected $fillable = ['title', 'description', 'user_id', 'image', 'status', 'signers', 'category'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(PetitionImage::class);
    }

    public function signerUsers()
    {
        return $this->belongsToMany(User::class, 'petition_signers')->withTimestamps();
    }
}
