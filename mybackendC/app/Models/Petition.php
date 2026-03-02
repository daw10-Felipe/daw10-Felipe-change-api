<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Petition extends Model
{
    // Campos que permitimos asignar masivamente.
    protected $fillable = ['title', 'description', 'user_id', 'image', 'status', 'signers'];

    // Relación: Una petición pertenece a un único usuario.
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación: Una petición puede tener múltiples imágenes.
    public function images()
    {
        return $this->hasMany(PetitionImage::class);
    }
}
