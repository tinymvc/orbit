<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>

<body>

    <h1>Welcome {{ $user->display_name }}!</h1>
    <p>Please click the button below to verify your email address.</p>
    <p>
        <a href="{{ route('admin.email.verification')->withQuery(['token' => $token]) }}"
            style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify
            Email</a>
    </p>
    <p>Thanks,<br>The {{ config('app.name') }} Team</p>

</body>

</html>
