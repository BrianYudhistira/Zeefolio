<?php

namespace App\Helpers;

class ResponseHelper
{
    public static function success(string $message = 'Success', mixed $data = null, int $statusCode = 200) 
    {
        return response()->json([
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function error(string $message = 'Internal Server Error', mixed $data = null, int $statusCode = 500) 
        {
        return response()->json([
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }
}