<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbit — Dashboard Starter Kit by TinyMVC</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet">
    <style>
        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :root {
            --rose-50: #fff1f2;
            --rose-100: #ffe4e6;
            --rose-200: #fecdd3;
            --rose-300: #fda4af;
            --rose-400: #fb7185;
            --rose-500: #f43f5e;
            --rose-600: #e11d48;
            --rose-700: #be123c;
            --rose-800: #9f1239;
            --rose-900: #881337;
            --rose-950: #4c0519;
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-300: #cbd5e1;
            --slate-400: #94a3b8;
            --slate-500: #64748b;
            --slate-600: #475569;
            --slate-700: #334155;
            --slate-800: #1e293b;
            --slate-900: #0f172a;
            --slate-950: #020617;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--slate-950);
            color: var(--slate-200);
            min-height: 100vh;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        /* ─── Animated gradient background ─────────────────────────── */
        .bg-glow {
            position: fixed;
            inset: 0;
            z-index: 0;
            overflow: hidden;
            pointer-events: none;
        }

        .bg-glow::before,
        .bg-glow::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            opacity: .25;
            animation: float 12s ease-in-out infinite alternate;
        }

        .bg-glow::before {
            width: 600px;
            height: 600px;
            background: var(--rose-600);
            top: -10%;
            left: -8%;
        }

        .bg-glow::after {
            width: 500px;
            height: 500px;
            background: var(--rose-400);
            bottom: -10%;
            right: -5%;
            animation-delay: -6s;
        }

        @keyframes float {
            0% {
                transform: translate(0, 0) scale(1);
            }

            100% {
                transform: translate(60px, 40px) scale(1.15);
            }
        }

        /* ─── Subtle grid pattern ──────────────────────────────────── */
        .grid-pattern {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background-image:
                linear-gradient(rgba(255, 255, 255, .02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, .02) 1px, transparent 1px);
            background-size: 64px 64px;
        }

        /* ─── Layout ───────────────────────────────────────────────── */
        .wrapper {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        /* ─── Nav ──────────────────────────────────────────────────── */
        nav {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1120px;
            width: 100%;
            margin: 0 auto;
            padding: 1.5rem 1.5rem;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: .65rem;
            text-decoration: none;
            color: var(--slate-50);
            font-weight: 700;
            font-size: 1.2rem;
            letter-spacing: -.02em;
        }

        .logo svg {
            width: 32px;
            height: 32px;
            color: var(--rose-500);
        }

        .nav-links {
            display: flex;
            gap: .25rem;
            align-items: center;
        }

        .nav-links a {
            text-decoration: none;
            font-size: .875rem;
            font-weight: 500;
            padding: .5rem 1rem;
            border-radius: .5rem;
            transition: all .2s;
        }

        .nav-link {
            color: var(--slate-400);
        }

        .nav-link:hover {
            color: var(--slate-50);
            background: rgba(255, 255, 255, .05);
        }

        .nav-cta {
            color: white;
            background: var(--rose-600);
            margin-left: .5rem;
        }

        .nav-cta:hover {
            background: var(--rose-500);
        }

        /* ─── Hero ─────────────────────────────────────────────────── */
        .hero {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem 1.5rem 4rem;
            max-width: 820px;
            margin: 0 auto;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: .4rem;
            font-size: .75rem;
            font-weight: 600;
            letter-spacing: .04em;
            text-transform: uppercase;
            color: var(--rose-400);
            background: rgba(244, 63, 94, .1);
            border: 1px solid rgba(244, 63, 94, .2);
            padding: .35rem .85rem;
            border-radius: 999px;
            margin-bottom: 1.75rem;
        }

        .badge span {
            font-size: .85rem;
        }

        h1 {
            font-size: clamp(2.5rem, 6vw, 4rem);
            font-weight: 800;
            line-height: 1.08;
            letter-spacing: -.035em;
            color: var(--slate-50);
            margin-bottom: 1.25rem;
        }

        h1 .accent {
            background: linear-gradient(135deg, var(--rose-400), var(--rose-600));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            font-size: 1.125rem;
            line-height: 1.7;
            color: var(--slate-400);
            max-width: 580px;
            margin-bottom: 2.5rem;
        }

        /* ─── CTA Buttons ──────────────────────────────────────────── */
        .cta-group {
            display: flex;
            gap: .75rem;
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 3.5rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
            font-family: inherit;
            font-size: .9rem;
            font-weight: 600;
            padding: .75rem 1.65rem;
            border-radius: .625rem;
            border: none;
            cursor: pointer;
            text-decoration: none;
            transition: all .2s;
        }

        .btn-primary {
            color: white;
            background: var(--rose-600);
            box-shadow: 0 0 0 0 rgba(244, 63, 94, .4), 0 1px 2px rgba(0, 0, 0, .3);
        }

        .btn-primary:hover {
            background: var(--rose-500);
            box-shadow: 0 0 24px 2px rgba(244, 63, 94, .3), 0 1px 2px rgba(0, 0, 0, .3);
            transform: translateY(-1px);
        }

        .btn-secondary {
            color: var(--slate-300);
            background: rgba(255, 255, 255, .06);
            border: 1px solid rgba(255, 255, 255, .1);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, .1);
            color: var(--slate-50);
            transform: translateY(-1px);
        }

        .btn svg {
            width: 18px;
            height: 18px;
        }

        /* ─── Tech Pills ───────────────────────────────────────────── */
        .tech-row {
            display: flex;
            gap: .5rem;
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .pill {
            font-size: .75rem;
            font-weight: 500;
            color: var(--slate-400);
            background: rgba(255, 255, 255, .04);
            border: 1px solid rgba(255, 255, 255, .07);
            padding: .3rem .75rem;
            border-radius: 999px;
            transition: all .2s;
        }

        .pill:hover {
            color: var(--slate-200);
            border-color: rgba(255, 255, 255, .15);
            background: rgba(255, 255, 255, .07);
        }

        /* ─── Feature Cards ────────────────────────────────────────── */
        .features {
            max-width: 1120px;
            margin: 0 auto;
            padding: 0 1.5rem 5rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.25rem;
        }

        .card {
            background: rgba(255, 255, 255, .03);
            border: 1px solid rgba(255, 255, 255, .06);
            border-radius: .875rem;
            padding: 1.75rem;
            transition: all .3s;
        }

        .card:hover {
            background: rgba(255, 255, 255, .05);
            border-color: rgba(244, 63, 94, .2);
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, .2);
        }

        .card-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: .625rem;
            background: rgba(244, 63, 94, .1);
            color: var(--rose-400);
            margin-bottom: 1rem;
        }

        .card-icon svg {
            width: 20px;
            height: 20px;
        }

        .card h3 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--slate-50);
            margin-bottom: .5rem;
        }

        .card p {
            font-size: .875rem;
            line-height: 1.65;
            color: var(--slate-400);
        }

        /* ─── Code Block ───────────────────────────────────────────── */
        .install-block {
            max-width: 580px;
            margin: 0 auto 4rem;
            background: rgba(0, 0, 0, .4);
            border: 1px solid rgba(255, 255, 255, .07);
            border-radius: .75rem;
            overflow: hidden;
			text-align: left;
        }

        .install-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: .6rem 1rem;
            background: rgba(255, 255, 255, .03);
            border-bottom: 1px solid rgba(255, 255, 255, .06);
        }

        .install-header span {
            font-size: .75rem;
            font-weight: 500;
            color: var(--slate-500);
        }

        .install-dots {
            display: flex;
            gap: 5px;
        }

        .install-dots i {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: block;
        }

        .install-dots i:nth-child(1) {
            background: #ef4444;
        }

        .install-dots i:nth-child(2) {
            background: #eab308;
        }

        .install-dots i:nth-child(3) {
            background: #22c55e;
        }

        .install-code {
            padding: 1.1rem 1.25rem;
            font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
            font-size: .82rem;
            line-height: 1.8;
            color: var(--slate-300);
            white-space: pre;
            overflow-x: auto;
        }

        .install-code .comment {
            color: var(--slate-600);
        }

        .install-code .cmd {
            color: var(--rose-400);
        }

        .install-code .arg {
            color: var(--slate-400);
        }

        /* ─── Footer ───────────────────────────────────────────────── */
        footer {
            text-align: center;
            padding: 2rem 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, .05);
            font-size: .8rem;
            color: var(--slate-600);
        }

        footer a {
            color: var(--rose-400);
            text-decoration: none;
        }

        footer a:hover {
            text-decoration: underline;
        }

        /* ─── Responsive ───────────────────────────────────────────── */
        @media (max-width: 640px) {
            nav {
                padding: 1rem;
            }

            .hero {
                padding: 1.5rem 1rem 3rem;
            }

            .cta-group {
                flex-direction: column;
                align-items: center;
            }

            .btn {
                width: 100%;
                justify-content: center;
                max-width: 300px;
            }

            .features {
                padding: 0 1rem 3rem;
            }
        }
    </style>
</head>

<body>

    <div class="bg-glow"></div>
    <div class="grid-pattern"></div>

    <div class="wrapper">

        <!-- Nav -->
        <nav>
            <a href="/" class="logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                </svg>
                Orbit
            </a>
            <div class="nav-links">
                <a href="https://github.com/tinymvc/orbit" class="nav-link" target="_blank">GitHub</a>
                <a href="https://packagist.org/packages/tinymvc/orbit" class="nav-link" target="_blank">Packagist</a>
                <a href="/admin" class="nav-links nav-cta">Dashboard →</a>
            </div>
        </nav>

        <!-- Hero -->
        <section class="hero">
            <div class="badge">
                <span>🚀</span> Open Source Dashboard Starter Kit
            </div>

            <h1>
                Build Admin Panels<br>
                <span class="accent">Faster Than Ever</span>
            </h1>

            <p class="subtitle">
                Orbit is a production-ready dashboard starter kit built on
                <strong style="color:var(--slate-200)">TinyMVC</strong>,
                <strong style="color:var(--slate-200)">Inertia.js</strong> &amp;
                <strong style="color:var(--slate-200)">React</strong>.
                Define one PHP class per entity — get a full CRUD interface automatically.
            </p>

            <div class="cta-group">
                <a href="/admin" class="btn btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Open Dashboard
                </a>
                <a href="https://github.com/tinymvc/orbit" class="btn btn-secondary" target="_blank">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.694.825.577C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    View on GitHub
                </a>
            </div>

            <!-- Install snippet -->
            <div class="install-block">
                <div class="install-header">
                    <div class="install-dots"><i></i><i></i><i></i></div>
                    <span>Terminal</span>
                </div>
                <div class="install-code"><span class="comment"># Quick install</span>
<span class="cmd">composer</span> <span class="arg">create-project tinymvc/orbit my-project</span>
<span class="cmd">cd</span> <span class="arg">my-project</span>
<span class="cmd">npm</span> <span class="arg">install && npm run dev</span>

<span class="comment"># Start the server</span>
<span class="cmd">php</span> <span class="arg">spark serve</span></div>
            </div>

            <!-- Tech pills -->
            <div class="tech-row">
                <span class="pill">PHP 8.2+</span>
                <span class="pill">Inertia.js 2</span>
                <span class="pill">React 19</span>
                <span class="pill">Tailwind CSS 4</span>
                <span class="pill">shadcn/ui</span>
                <span class="pill">Recharts</span>
                <span class="pill">Tiptap</span>
                <span class="pill">Vite</span>
            </div>
        </section>

        <!-- Features -->
        <section class="features">
            <div class="card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path
                            d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                    </svg>
                </div>
                <h3>BREAD Module</h3>
                <p>Define one PHP resource class and get a complete CRUD interface — table, forms, filters, bulk
                    actions, file uploads, relationships — all wired up automatically.</p>
            </div>

            <div class="card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                        <path d="M7 16l4-8 4 4 4-6" />
                    </svg>
                </div>
                <h3>Dashboard Builder</h3>
                <p>Build beautiful analytics dashboards with stat cards and six chart types using a fluent PHP API —
                    Bar, Line, Area, Pie, Radar, and Radial charts out of the box.</p>
            </div>

            <div class="card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                </div>
                <h3>Roles &amp; Permissions</h3>
                <p>Granular role-based access control. Assign permissions per role and protect any resource, route, or
                    menu item with a single permission key.</p>
            </div>

            <div class="card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    </svg>
                </div>
                <h3>Authentication</h3>
                <p>Complete auth system with login, forgot password, reset password, and email verification — styled and
                    ready to go.</p>
            </div>

            <div class="card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="m18 16 4-4-4-4" />
                        <path d="m6 8-4 4 4 4" />
                        <path d="m14.5 4-5 16" />
                    </svg>
                </div>
                <h3>Modern Stack</h3>
                <p>Inertia.js bridges PHP and React — no REST APIs needed. Server-side routing with an SPA-like
                    experience, powered by Vite for instant HMR.</p>
            </div>

            <div class="card">
                <div class="card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8" />
                        <path d="M12 17v4" />
                    </svg>
                </div>
                <h3>Beautiful UI</h3>
                <p>shadcn/ui components, Tailwind CSS 4, Tiptap rich text editor, TanStack Table — a polished,
                    accessible, and responsive admin interface.</p>
            </div>
        </section>

        <!-- Footer -->
        <footer>
            Built with ♥ by <a href="https://github.com/shahinmoyshan" target="_blank">Shahin Moyshan</a> · Powered by
            <a href="https://github.com/tinymvc/tinycore" target="_blank">TinyMVC</a> · MIT License
        </footer>

    </div>

</body>

</html>
