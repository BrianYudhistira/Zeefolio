<?php

namespace App\Http\Controllers\API;
use Illuminate\Http\Request;

class UserController
{
    public function getUserProfile(Request $request)
    {
        $user = $request->user();

        if(!$user) {
            return response()->json(['message' => 'User not found', 'data' => null], 404);
        }

        return response()->json([
            'message' => 'User profile retrieved successfully',
            'data' => $user,
        ], 200);
    }
}