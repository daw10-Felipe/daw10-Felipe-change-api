<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetitionController;
use App\Http\Controllers\AdminController;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);


Route::middleware('auth:api')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);


    Route::get('petitions/signed', [PetitionController::class, 'signedPetitions']);
    Route::post('petitions', [PetitionController::class, 'store']);
    Route::put('petitions/{id}', [PetitionController::class, 'update']);
    Route::delete('petitions/{id}', [PetitionController::class, 'destroy']);

    Route::post('petitions/{id}/sign', [PetitionController::class, 'sign']);
    Route::delete('petitions/{id}/sign', [PetitionController::class, 'unsign']);
});


Route::middleware('api')->group(function () {
    Route::get('petitions', [PetitionController::class, 'index']);
    Route::get('petitions/{id}', [PetitionController::class, 'show']);
    Route::get('categories', [PetitionController::class, 'indexCategories']);
});


Route::middleware('api')->post('refresh', [AuthController::class, 'refresh']);



Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    Route::get('stats', [AdminController::class, 'stats']);

    Route::get('users', [AdminController::class, 'indexUsers']);
    Route::get('users/{id}', [AdminController::class, 'showUser']);
    Route::put('users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('users/{id}', [AdminController::class, 'destroyUser']);

    Route::get('petitions', [AdminController::class, 'indexPetitions']);
    Route::get('petitions/{id}', [AdminController::class, 'showPetition']);
    Route::put('petitions/{id}', [AdminController::class, 'updatePetition']);
    Route::delete('petitions/{id}', [AdminController::class, 'destroyPetition']);

    Route::get('categories', [AdminController::class, 'indexCategories']);
    Route::post('categories', [AdminController::class, 'storeCategory']);
    Route::put('categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('categories/{id}', [AdminController::class, 'destroyCategory']);
});

