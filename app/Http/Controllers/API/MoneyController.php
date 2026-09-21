<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Models\BalanceTrack;

use Carbon\Carbon;

class MoneyController
{
    public function trackBalance(Request $request)
    {
        $user = $request->user();
        
        $balance_tracks = BalanceTrack::where('user_id', $user->id)
            ->orderBy('transaction_date', 'desc')
            ->paginate(50);

        return response()->json([
            'message' => 'Balance tracked successfully',
            'data' => [
                'balance_tracks' => $balance_tracks->items(),
                'pagination' => [
                    'current_page' => $balance_tracks->currentPage(),
                    'last_page' => $balance_tracks->lastPage(),
                    'per_page' => $balance_tracks->perPage(),
                    'total' => $balance_tracks->total(),
                ],
            ],
        ], 200);
    }

    public function trackBalanceCustom(Request $request)
    {

        $input = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $input['start_date'] ?? null;
        $endDate = $input['end_date'] ?? null;
        $user = $request->user();

        $query = BalanceTrack::where('user_id', $user->id);
        if ($startDate && $endDate) {
            $query->whereDate('transaction_date', '>=', $startDate);
            $query->whereDate('transaction_date', '<=', $endDate);
        }
        else{
            return response()->json([
                'message' => 'start_date and end_date are required for custom tracking.',
                'data' => null,
            ], 400);
        }

        $balance_tracks = $query->orderBy('transaction_date', 'desc')->paginate(50);

        return response()->json([
            'message' => 'Custom balance tracked successfully',
            'data' => [
                'balance_tracks' => $balance_tracks->items(),
                'pagination' => [
                    'current_page' => $balance_tracks->currentPage(),
                    'last_page' => $balance_tracks->lastPage(),
                    'per_page' => $balance_tracks->perPage(),
                    'total' => $balance_tracks->total(),
                ],
            ],
        ], 200);
    }

    public function totalBalance(Request $request){
        $user = $request->user();

        $balance = BalanceTrack::where('user_id', $user->id)
            ->get();

        $total_type = $request->input('total_type', 0);
        if($total_type == 1){
            $today = Carbon::now()->format('Y-m-d');
            $total_pengeluaran = $balance->where('type', 1)
                ->where('transaction_date', $today)
                ->sum('amount');
            $total_pendapatan = $balance->where('type', 2)
                ->where('transaction_date', $today)
                ->sum('amount');
            $total_transfer = $balance->where('type', 3)
                ->where('transaction_date', $today)
                ->sum('amount');
        }elseif($total_type == 2){
            $startOfWeek = Carbon::now()->startOfWeek()->format('Y-m-d');
            $endOfWeek = Carbon::now()->endOfWeek()->format('Y-m-d');
            $total_pengeluaran = $balance->where('type', 1)
                ->whereBetween('transaction_date', [$startOfWeek, $endOfWeek])
                ->sum('amount');
            $total_pendapatan = $balance->where('type', 2)
                ->whereBetween('transaction_date', [$startOfWeek, $endOfWeek])
                ->sum('amount');
            $total_transfer = $balance->where('type', 3)
                ->whereBetween('transaction_date', [$startOfWeek, $endOfWeek])
                ->sum('amount');
        }elseif($total_type == 3){
            $currentMonth = Carbon::now()->month;
            $currentYear = Carbon::now()->year;
            $total_pengeluaran = $balance->where('type', 1)
                ->filter(function($item) use ($currentMonth, $currentYear) {
                    $date = Carbon::parse($item->transaction_date);
                    return $date->month == $currentMonth && $date->year == $currentYear;
                })
                ->sum('amount');
            $total_pendapatan = $balance->where('type', 2)
                ->filter(function($item) use ($currentMonth, $currentYear) {
                    $date = Carbon::parse($item->transaction_date);
                    return $date->month == $currentMonth && $date->year == $currentYear;
                })
                ->sum('amount');
            $total_transfer = $balance->where('type', 3)
                ->filter(function($item) use ($currentMonth, $currentYear) {
                    $date = Carbon::parse($item->transaction_date);
                    return $date->month == $currentMonth && $date->year == $currentYear;
                })
                ->sum('amount');
        } else {
            $total_pengeluaran = $balance->where('type', 1)->sum('amount');
            $total_pendapatan  = $balance->where('type', 2)->sum('amount');
            $total_transfer    = $balance->where('type', 3)->sum('amount');
        }

        $total_balance = $total_pendapatan - $total_pengeluaran;

        return response()->json([
            'message' => 'Total balance retrieved successfully',
            'data' => [
                'total_pengeluaran' => $total_pengeluaran,
                'total_pendapatan' => $total_pendapatan,
                'total_transfer' => $total_transfer,
                'total_balance' => $total_balance,
            ],
        ]);
    }

    public function addBalance(Request $request)
    {
        

    }
}