<?php

namespace App\Services;

use App\Models\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log as LaravelLog;

class LogService
{
    private function getMetadata($customMetadata = [])
    {
        $ipAddress = $customMetadata['ip_address'] ?? request()->ip();
        $userAgent = $customMetadata['user_agent'] ?? request()->userAgent();
        $location = $customMetadata['location'] ?? $this->getLocationFromIp($ipAddress);

        return [
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'location' => $location,
        ];
    }

    private function getLocationFromIp($ip)
    {
        if ($ip === '127.0.0.1' || $ip === '::1' || str_starts_with($ip, '192.168.')) {
            return 'Local';
        }

        try {
            $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}");
            
            if ($response->successful()) {
                $data = $response->json();
                if ($data['status'] === 'success') {
                    return "{$data['city']}, {$data['country']}";
                }
            }
        } catch (\Exception $e) {
        }

        return 'Unknown';
    }

    private function createLog($type, $module, $message, $metadata = [])
    {
        $requestMetadata = $this->getMetadata($metadata);
        $userId = Auth::check() ? Auth::id() : null;

        LaravelLog::log($type, $message, array_filter([
            'module' => $module,
            'user_id' => $userId,
            ...$requestMetadata,
        ], static fn ($value) => $value !== null));

        $logData = array_merge(
            [
                'type' => $type,
                'module' => $module,
                'message' => $message,
                'user_id' => $userId,
            ],
            $requestMetadata
        );

        return Log::create($logData);
    }

    public function infoLog( $module = null, $message = null, $metadata = [])
    {
        return $this->createLog('info', $module, $message, $metadata);
    }

    public function warningLog($module = null, $message = null, $metadata = [])
    {
        return $this->createLog('warning', $module, $message, $metadata);
    }

    public function errorLog($module = null, $message = null, $metadata = [])
    {
        return $this->createLog('error', $module, $message, $metadata);
    }
}