<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Petition;
use App\Models\PetitionImage;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class PetitionController extends Controller
{
    public function index(Request $request)
    {
        $petitions = Petition::with(['user', 'images'])
            ->withCount('signerUsers as signers_count')
            ->get();

        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            $user = null;
        }

        $signedIds = [];
        if ($user) {
            $signedIds = $user->signedPetitions()->pluck('petitions.id')->toArray();
        }

        $result = $petitions->map(function ($petition) use ($signedIds) {
            $data = $petition->toArray();
            $data['has_signed'] = in_array($petition->id, $signedIds);
            return $data;
        });

        return response()->json($result);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string|max:100',
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048',
        ]);

        $data = $request->only('title', 'description', 'category');
        $petition = $request->user()->petitions()->create($data);


        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('petitions', 'public');
                $petition->images()->create(['path' => $path]);
            }
        }

        return response()->json($petition->load('images'), 201);
    }

    public function show(Request $request, string $id)
    {
        $petition = Petition::with(['user', 'images'])
            ->withCount('signerUsers as signers_count')
            ->findOrFail($id);

        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            $user = null;
        }

        $data = $petition->toArray();
        $data['has_signed'] = $user ? $petition->signerUsers()->where('user_id', $user->id)->exists() : false;

        return response()->json($data);
    }

    public function update(Request $request, string $id)
    {
        $petition = Petition::findOrFail($id);

        if ($request->user()->id !== $petition->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'nullable|string|max:100',
            'images' => 'nullable|array',
            'images.*' => 'image|max:10240',
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'integer',
        ]);

        $petition->update($request->only('title', 'description', 'category'));


        if ($request->has('delete_images')) {
            $toDelete = PetitionImage::whereIn('id', $request->delete_images)
                ->where('petition_id', $petition->id)
                ->get();

            foreach ($toDelete as $img) {
                Storage::disk('public')->delete($img->path);
                $img->delete();
            }
        }


        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('petitions', 'public');
                $petition->images()->create(['path' => $path]);
            }
        }

        return response()->json($petition->load('images'));
    }

    public function destroy(Request $request, string $id)
    {
        $petition = Petition::findOrFail($id);

        if ($request->user()->id !== $petition->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }


        foreach ($petition->images as $img) {
            Storage::disk('public')->delete($img->path);
        }

        $petition->delete();

        return response()->json(['message' => 'Petition deleted']);
    }

    public function sign(Request $request, string $id)
    {
        $petition = Petition::findOrFail($id);
        $user = $request->user();

        if ($petition->signerUsers()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Ya has firmado esta petición'], 409);
        }

        $petition->signerUsers()->attach($user->id);
        $petition->loadCount('signerUsers as signers_count');

        return response()->json([
            'message' => 'Petición firmada con éxito',
            'signers_count' => $petition->signers_count,
            'has_signed' => true,
        ]);
    }

    public function unsign(Request $request, string $id)
    {
        $petition = Petition::findOrFail($id);
        $user = $request->user();

        if (!$petition->signerUsers()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'No has firmado esta petición'], 409);
        }

        $petition->signerUsers()->detach($user->id);
        $petition->loadCount('signerUsers as signers_count');

        return response()->json([
            'message' => 'Firma retirada con éxito',
            'signers_count' => $petition->signers_count,
            'has_signed' => false,
        ]);
    }
}
