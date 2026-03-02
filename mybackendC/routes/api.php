<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetitionController;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);


// Grupo de rutas protegidas. Se necesita enviar el token para acceder a ellas (Logout, Perfil, CRUD de peticiones).
Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    
    Route::post('petitions', [PetitionController::class, 'store']);
    Route::put('petitions/{id}', [PetitionController::class, 'update']);
    Route::delete('petitions/{id}', [PetitionController::class, 'destroy']);
});


// Rutas públicas para ver las peticiones (listado y detalle) sin necesidad de estar logueado.
Route::get('petitions', [PetitionController::class, 'index']);
Route::get('petitions/{id}', [PetitionController::class, 'show']);


Route::middleware('api')->post('refresh', [AuthController::class, 'refresh']);
