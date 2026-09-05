<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Merges About data (image_path, cv_path) into the Home table,
     * then drops the about table entirely.
     */
    public function up(): void
    {
        // Step 1: Add image_path and cv_path to home table
        Schema::table('home', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('logo_path');
            $table->string('cv_path')->nullable()->after('image_path');
        });

        // Step 2: Migrate existing about data into the home table
        DB::statement('
            UPDATE home
            INNER JOIN about ON home.portfolio_user_id = about.portfolio_user_id
            SET
                home.image_path = about.image_path,
                home.cv_path    = about.cv_path
        ');

        // Step 3: Drop the about table (no longer needed)
        Schema::dropIfExists('about');
    }

    /**
     * Reverse the migrations.
     *
     * Recreates the about table and migrates data back from home.
     */
    public function down(): void
    {
        // Recreate about table
        Schema::create('about', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_user_id')->constrained('portfolio_users')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->string('cv_path')->nullable();
            $table->timestamps();
        });

        // Migrate data back
        DB::statement('
            INSERT INTO about (portfolio_user_id, image_path, cv_path, created_at, updated_at)
            SELECT portfolio_user_id, image_path, cv_path, NOW(), NOW()
            FROM home
            WHERE image_path IS NOT NULL OR cv_path IS NOT NULL
        ');

        // Remove columns from home
        Schema::table('home', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'cv_path']);
        });
    }
};
