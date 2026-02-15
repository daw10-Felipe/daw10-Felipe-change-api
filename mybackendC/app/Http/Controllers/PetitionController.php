<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Petition;

class PetitionController extends Controller
{
    public function index()
    {
        return response()->json(Petition::with('user')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $data = $request->only('title', 'description');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('petitions', 'public');
            $data['image'] = $path;
        }

        $petition = $request->user()->petitions()->create($data);

        return response()->json($petition, 201);
    }

    public function show(string $id)
    {
        $petition = Petition::with('user')->findOrFail($id);
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
            'image' => 'nullable|image|max:10240',
        ]);

        $data = $request->only('title', 'description');

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($petition->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($petition->image);
            }
            $path = $request->file('image')->store('petitions', 'public');
            $data['image'] = $path;
        }

        $petition->update($data);

        return response()->json($petition);
    }

    public function destroy(Request $request, string $id)
    {
        $petition = Petition::findOrFail($id);

        if ($request->user()->id !== $petition->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $petition->delete();

        return response()->json(['message' => 'Petition deleted']);
    }
}
