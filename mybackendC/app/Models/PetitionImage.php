<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PetitionImage extends Model
{
    // Campos que se pueden asignar masivamente
    protected $fillable = ['petition_id', 'path'];

    // Relación: esta imagen pertenece a una petición
    public function petition()
    {
        return $this->belongsTo(Petition::class);
    }
}
