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
        $search = mb_substr(trim((string) $request->query('search', '')), 0, 100);
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
            $escapedSearch = addcslashes($search, '%_\\');
            $query->where(function ($q) use ($search, $escapedSearch) {
                $q->where('message', 'like', "%{$escapedSearch}%")
                    ->orWhere('module', 'like', "%{$escapedSearch}%")
                    ->orWhere('ip_address', 'like', "%{$escapedSearch}%")
                    ->orWhere('location', 'like', "%{$escapedSearch}%");

                if (is_numeric($search)) {
                    $q->orWhere('user_id', (int) $search)
                        ->orWhere('id', (int) $search);
                }

                $q->orWhereHas('user', function ($userQuery) use ($escapedSearch) {
                    $userQuery->where('name', 'like', "%{$escapedSearch}%")
                        ->orWhere('username', 'like', "%{$escapedSearch}%")
                        ->orWhere('email', 'like', "%{$escapedSearch}%");
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

        $rawStats = Log::query()
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN type = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN type = 'info' THEN 1 ELSE 0 END) as info_count,
                SUM(CASE WHEN type = 'warning' THEN 1 ELSE 0 END) as warning_count,
                SUM(CASE WHEN type = 'error' THEN 1 ELSE 0 END) as error_count
            ")
            ->first();

        $stats = [
            'total' => (int) ($rawStats->total ?? 0),
            'admin' => (int) ($rawStats->admin_count ?? 0),
            'info' => (int) ($rawStats->info_count ?? 0),
            'warning' => (int) ($rawStats->warning_count ?? 0),
            'error' => (int) ($rawStats->error_count ?? 0),
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
