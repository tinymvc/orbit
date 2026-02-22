<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>

<body>

    <h1>Password Reset Request</h1>
    <p>Hi {{ $user->display_name }},</p>
    <p>You recently requested to reset your password for your account. Click the button below to reset it.</p>
    <p>
        <a href="{{ route('admin.password.reset')->withQuery(['token' => $token]) }}"
            style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset
            Password</a>
    </p>
    <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
    <p>Thanks,<br>The {{ config('app.name') }} Team</p>

</body>

</html>
