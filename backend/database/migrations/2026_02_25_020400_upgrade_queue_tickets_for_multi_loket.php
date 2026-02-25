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
        Schema::table('queue_tickets', function (Blueprint $table) {
            $table->foreignId('loket_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('ticket_no', 32)->nullable()->after('loket_id');
            $table->unsignedInteger('sequence_no')->nullable()->after('queue_date');
            $table->foreignId('called_by')->nullable()->after('served_by')->constrained('users')->nullOnDelete();
            $table->unsignedInteger('called_count')->default(0)->after('called_by');
        });

        DB::table('queue_tickets')
            ->where('status', 'called')
            ->update(['status' => 'serving']);

        Schema::table('queue_tickets', function (Blueprint $table) {
            $table->index(['loket_id', 'queue_date', 'status'], 'queue_tickets_loket_date_status_idx');
            $table->unique(['loket_id', 'queue_date', 'sequence_no'], 'queue_tickets_loket_date_seq_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('queue_tickets', function (Blueprint $table) {
            $table->dropUnique('queue_tickets_loket_date_seq_unique');
            $table->dropIndex('queue_tickets_loket_date_status_idx');
            $table->dropConstrainedForeignId('called_by');
            $table->dropColumn('called_count');
            $table->dropColumn('sequence_no');
            $table->dropColumn('ticket_no');
            $table->dropConstrainedForeignId('loket_id');
        });

        DB::table('queue_tickets')
            ->where('status', 'serving')
            ->update(['status' => 'called']);
    }
};
