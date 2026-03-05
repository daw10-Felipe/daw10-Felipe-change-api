<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PetitionImage extends Model
{
    protected $fillable = ['petition_id', 'path'];

    public function petition()
    {
        return $this->belongsTo(Petition::class);
    }
}
