<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations (PERF-05: Add composite indexes for frequently filtered/ordered columns).
     */
    public function up(): void
    {
        if (Schema::hasTable('logs')) {
            Schema::table('logs', function (Blueprint $table) {
                $table->index(['module', 'created_at'], 'logs_module_created_at_idx');
                $table->index(['user_id', 'created_at'], 'logs_user_created_at_idx');
            });
        }

        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->index(['portfolio_user_id', 'is_active', 'sort_order'], 'projects_portfolio_active_sort_idx');
            });
        }

        if (Schema::hasTable('experiences')) {
            Schema::table('experiences', function (Blueprint $table) {
                $table->index(['portfolio_user_id', 'sort_order'], 'experiences_portfolio_sort_idx');
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index('role', 'users_role_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('logs')) {
            Schema::table('logs', function (Blueprint $table) {
                $table->dropIndex('logs_module_created_at_idx');
                $table->dropIndex('logs_user_created_at_idx');
            });
        }

        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropIndex('projects_portfolio_active_sort_idx');
            });
        }

        if (Schema::hasTable('experiences')) {
            Schema::table('experiences', function (Blueprint $table) {
                $table->dropIndex('experiences_portfolio_sort_idx');
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_role_idx');
            });
        }
    }
};

