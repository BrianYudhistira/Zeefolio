<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>New Message</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #0b1120;
            /* Biru gelap */
            color: #f8fafc;
            margin: 0;
            padding: 40px 20px;
        }

        .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #1e293b;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .header {
            text-align: center;
            padding: 30px 20px 20px;
            border-bottom: 1px solid #334155;
        }

        .header img {
            height: 60px;
            width: auto;
            margin-bottom: 12px;
        }

        .header h1 {
            margin: 0;
            font-size: 22px;
            color: #e2e8f0;
            letter-spacing: 1px;
        }

        .content {
            padding: 30px;
        }

        .item {
            margin-bottom: 20px;
        }

        .item:last-child {
            margin-bottom: 0;
        }

        .item-label {
            font-size: 13px;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 6px;
            display: block;
            letter-spacing: 0.5px;
        }

        .item-value {
            font-size: 16px;
            color: #f1f5f9;
            line-height: 1.5;
        }

        .item-value a {
            color: #38bdf8;
            text-decoration: none;
        }

        .message-box {
            background-color: #0f172a;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #334155;
            white-space: pre-wrap;
            margin-top: 5px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            @if (file_exists(public_path('images/web_icon.png')))
                <img src="{{ $message->embed(public_path('images/web_icon.png')) }}" alt="ZeeFolio Logo">
            @endif
            <h1>ZeeFolio</h1>
        </div>
        <div class="content">
            <p
                style="text-align: center; color: #cbd5e1; font-size: 15px; margin-top: 0; margin-bottom: 30px; line-height: 1.6;">
                <strong>Somebody wants to connect with you!</strong><br>
                Here is the message from your portfolio contact form.
            </p>

            <div class="item">
                <span class="item-label">Name</span>
                <div class="item-value">{{ $name }}</div>
            </div>

            <div class="item">
                <span class="item-label">Email</span>
                <div class="item-value">
                    <a href="mailto:{{ $email }}">{{ $email }}</a>
                </div>
            </div>

            <div class="item">
                <span class="item-label">Message</span>
                <div class="item-value message-box">{{ $senderMessage }}</div>
            </div>
        </div>
    </div>
</body>

</html>