<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Petition;
use App\Models\PetitionImage;
use Illuminate\Support\Facades\Storage;

class PetitionController extends Controller
{
    public function index()
    {
        return response()->json(Petition::with(['user', 'images'])->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'image|max:2048',
        ]);

        $data = $request->only('title', 'description');
        $petition = $request->user()->petitions()->create($data);


        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('petitions', 'public');
                $petition->images()->create(['path' => $path]);
            }
        }

        return response()->json($petition->load('images'), 201);
    }

    public function show(string $id)
    {
        $petition = Petition::with(['user', 'images'])->findOrFail($id);
        return response()->json($petition);
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
            'images' => 'nullable|array',
            'images.*' => 'image|max:10240',
            'delete_images' => 'nullable|array',
            'delete_images.*' => 'integer',
        ]);

        $petition->update($request->only('title', 'description'));


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
}
