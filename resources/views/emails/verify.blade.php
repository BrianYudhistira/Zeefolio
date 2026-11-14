<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Zeee-Hub</title>
    <style>
        /* Accent Button Style */
        .button-link {
            display: inline-block;
            background: linear-gradient(90deg, #2563eb, #1d4ed8);
            color: #ffffff !important;
            padding: 12px 28px;
            border-radius: 10px;
            font-weight: 600;
            text-decoration: none;
            font-size: 15px;
            transition: all 0.2s ease-in-out;
            box-shadow: 0 4px 8px rgba(37, 99, 235, 0.25);
        }

        .button-link:hover {
            background: linear-gradient(90deg, #1d4ed8, #1e40af);
            box-shadow: 0 5px 10px rgba(37, 99, 235, 0.35);
        }

        /* General Text Styling */
        body {
            background-color: #f3f4f6;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 500px;
            margin: 30px auto;
            padding: 16px;
        }

        .card {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 36px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header img {
            width: 60px;
            height: auto;
            margin-bottom: 10px;
        }

        .header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
        }

        .content {
            text-align: center;
            font-size: 15px;
        }

        .highlight-box {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 12px;
            color: #1e40af;
            font-size: 13px;
            margin-top: 25px;
            margin-bottom: 25px;
        }

        .footer {
            text-align: center;
            border-top: 1px solid #e5e7eb;
            margin-top: 25px;
            padding-top: 15px;
            color: #4b5563;
            font-size: 13px;
        }

        .sub-footer {
            text-align: center;
            font-size: 11px;
            color: #6b7280;
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            
            <div class="header">
                <img src="{{ asset('images/web_icon.png') }}" alt="Zeee-Hub Logo">
                <h1>Email Verification</h1>
            </div>

            <div class="content">
                <p style="margin-bottom: 18px;">Hello {{ $name }},</p>

                <p style="margin-bottom: 25px;">
                    Please click the button below to verify your email and activate your <strong>Zeee-Hub.com</strong> account.
                </p>

                <a href="{{ $url }}" class="button-link">Verify Email Address</a>

                <div class="highlight-box">
                    Link expires in <strong>60 minutes</strong>.
                </div>

                <p style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">
                    Having trouble? Copy and paste this link:
                </p>
                <p style="font-size: 12px; margin-top: 0;">
                    <a href="{{ $url }}" style="color: #2563eb; text-decoration: underline; word-break: break-all;">
                        {{ $url }}
                    </a>
                </p>
            </div>

            <div class="footer">
                <p style="margin: 0; font-weight: 600;">Not you? Ignore this email.</p>
            </div>

            <div class="sub-footer">
                <p style="margin: 0;">
                    This is an automated message. &copy; {{ date('Y') }} {{ config('app.name', 'Zeee-Hub') }}. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
