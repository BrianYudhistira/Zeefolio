<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('portfolio_users', 'skill_categories')) {
            Schema::table('portfolio_users', function (Blueprint $table) {
                $table->json('skill_categories')->nullable()->after('sections');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('portfolio_users', 'skill_categories')) {
            Schema::table('portfolio_users', function (Blueprint $table) {
                $table->dropColumn('skill_categories');
            });
        }
    }
};

