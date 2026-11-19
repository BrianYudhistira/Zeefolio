<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add user ownership and global scoping to skill categories.
     */
    public function up(): void
    {
        Schema::table('tech_stack_categories', function (Blueprint $table) {
            if (! Schema::hasColumn('tech_stack_categories', 'user_id')) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('name')
                    ->constrained('users')
                    ->cascadeOnDelete();
            }

            if (! Schema::hasColumn('tech_stack_categories', 'is_global')) {
                $table->boolean('is_global')->default(false)->after('user_id')->index();
            }

            $table->dropUnique(['name']);
            $table->index(['is_global', 'user_id']);
        });

        // Mark existing seeded/admin-created categories as global defaults.
        DB::table('tech_stack_categories')
            ->whereNull('user_id')
            ->update(['is_global' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tech_stack_categories', function (Blueprint $table) {
            $table->dropIndex(['is_global', 'user_id']);

            if (Schema::hasColumn('tech_stack_categories', 'is_global')) {
                $table->dropColumn('is_global');
            }

            if (Schema::hasColumn('tech_stack_categories', 'user_id')) {
                $table->dropConstrainedForeignId('user_id');
            }

            $table->unique('name');
        });
    }
};
