<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailLink extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [10, 30, 60];

    /**
     * Create a new message instance.
     */
    public string $url;
    public string $name;

    public function __construct(string $url, string $name)
    {
        $this->url = $url;
        $this->name = $name;
    }

    public function build()
    {
        return $this->subject('Verify Your Email Address')
                    ->view('emails.verify')
                    ->with([
                        'url' => $this->url,
                        'name' => $this->name,
                    ]);
    }
}
