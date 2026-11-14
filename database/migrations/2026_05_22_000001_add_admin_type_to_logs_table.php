<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('logs')) {
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE `logs` MODIFY COLUMN `type` ENUM('info', 'warning', 'error', 'admin') NOT NULL DEFAULT 'info'");
            }

            Schema::table('logs', function (Blueprint $table) {
                $table->index(['type', 'id'], 'logs_type_id_idx');
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
                $table->dropIndex('logs_type_id_idx');
            });

            if (DB::getDriverName() === 'mysql') {
                DB::statement("UPDATE `logs` SET `type` = 'info' WHERE `type` = 'admin'");
                DB::statement("ALTER TABLE `logs` MODIFY COLUMN `type` ENUM('info', 'warning', 'error') NOT NULL DEFAULT 'info'");
            }
        }
    }
};
