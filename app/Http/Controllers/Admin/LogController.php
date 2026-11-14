<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $module = trim((string) $request->query('module', 'all'));
        $type = trim((string) $request->query('type', 'all'));

        $query = Log::query()
            ->with('user:id,name,username,email,role')
            ->latest('id');

        if ($module !== '' && $module !== 'all') {
            $query->where('module', $module);
        }

        if ($type !== '' && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                    ->orWhere('module', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");

                if (is_numeric($search)) {
                    $q->orWhere('user_id', (int) $search)
                        ->orWhere('id', (int) $search);
                }

                $q->orWhereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
        }

        $logs = $query->paginate(25)->withQueryString();

        $modules = Log::query()
            ->whereNotNull('module')
            ->where('module', '!=', '')
            ->distinct()
            ->orderBy('module')
            ->pluck('module')
            ->values();

        $stats = [
            'total' => Log::count(),
            'info' => Log::where('type', 'info')->count(),
            'warning' => Log::where('type', 'warning')->count(),
            'error' => Log::where('type', 'error')->count(),
        ];

        return Inertia::render('Admin/Logs/Index', [
            'logs' => $logs,
            'modules' => $modules,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'module' => $module,
                'type' => $type,
            ],
        ]);
    }
}
