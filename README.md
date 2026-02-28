<p align="center">
  <img width="100%" height="1621" alt="orbit-tinymvc-dashboard" src="https://github.com/user-attachments/assets/6cb9b6ad-c53f-4b46-8f24-f1e0b318e774" />
  <img width="100%" alt="orbit-dashboard-shot" src="https://github.com/user-attachments/assets/16e6de11-bf84-46c2-ac44-0de2853ca9c3" />
  <img width="100%" height="917" alt="orbit-dashboard-posts" src="https://github.com/user-attachments/assets/5b4a5a7a-4b4b-4351-b4d6-94b3104824cf" />
</p>

<h1 align="center">Orbit — TinyMVC Dashboard Starter Kit</h1>

<p align="center">
  <strong>A lightweight, fast and flexible admin dashboard built on TinyMVC + Inertia.js + React + Shadcn</strong>
</p>

<p align="center">
  <a href="https://github.com/tinymvc/orbit"><img src="https://img.shields.io/github/license/tinymvc/orbit?style=flat-square" alt="License"></a>
  <a href="https://packagist.org/packages/tinymvc/orbit"><img src="https://img.shields.io/packagist/v/tinymvc/orbit?style=flat-square" alt="Packagist Version"></a>
  <img src="https://img.shields.io/badge/php-%3E%3D8.2-8892BF?style=flat-square" alt="PHP 8.2+">
  <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square" alt="React 19">
  <img src="https://img.shields.io/badge/inertia.js-2.x-6C63FF?style=flat-square" alt="Inertia.js 2">
  <img src="https://img.shields.io/badge/tailwindcss-4.x-38BDF8?style=flat-square" alt="Tailwind CSS 4">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
  - [Via Composer (Recommended)](#via-composer-recommended)
  - [Via Git Clone](#via-git-clone)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Default Login Credentials](#default-login-credentials)
- [Project Structure](#project-structure)
- [BREAD Module (Browse, Read, Edit, Add, Delete)](#bread-module)
  - [Creating a BREAD Resource](#creating-a-bread-resource)
  - [Resource Configuration](#resource-configuration)
  - [Form Fields](#form-fields)
  - [Table Columns](#table-columns)
  - [Filters](#filters)
  - [Bulk Actions](#bulk-actions)
  - [Permissions](#permissions)
  - [Dynamic Props](#dynamic-props)
  - [Lifecycle Hooks](#lifecycle-hooks)
  - [File Uploads](#file-uploads)
  - [Relationships](#relationships)
  - [Registering Routes](#registering-routes)
  - [Complete Resource Example](#complete-resource-example)
- [Dashboard Module](#dashboard-module)
  - [Stats Cards](#stats-cards)
  - [Charts](#charts)
  - [Date Range Picker](#date-range-picker)
  - [Dashboard Controller Example](#dashboard-controller-example)
- [Sidebar Menu Configuration](#sidebar-menu-configuration)
- [Permissions & Privileges](#permissions--privileges)
- [Available Spark Commands](#available-spark-commands)
- [License](#license)

---

## Overview

**Orbit** is a production-ready admin dashboard starter kit built on top of the [TinyMVC](https://github.com/tinymvc/tinycore) framework. It provides a robust foundation for building modern web applications with a clean, modular architecture.

Key highlights:

- **BREAD Module** — A powerful, zero-boilerplate CRUD system. Define one PHP resource class per entity and get a full admin interface (table, forms, filters, bulk actions) automatically — no per-model controllers or React pages needed.
- **Dashboard Module** — A fluent PHP API for building stat cards and charts (Bar, Line, Area, Pie, Radar, Radial) with date range filtering — all rendered via Recharts on the frontend.
- **Inertia.js** — Server-side routing + React SPA experience. No REST API layer needed.
- **Tailwind CSS 4 + shadcn/ui** — Beautiful, accessible UI components out of the box.
- **Authentication** — Login, forgot/reset password, email verification, user/role management with granular permissions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Framework** | [TinyMVC / Spark](https://github.com/tinymvc/tinycore) (PHP 8.2+) |
| **Server ↔ Client Bridge** | [Inertia.js 2](https://inertiajs.com/) |
| **Frontend** | [React 19](https://react.dev/) + TypeScript |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Rich Text Editor** | [Tiptap](https://tiptap.dev/) |
| **Data Tables** | [TanStack Table](https://tanstack.com/table) |
| **Build Tool** | [Vite](https://vitejs.dev/) |

---

## Installation

### Prerequisites

- **PHP** >= 8.2
- **Composer**
- **Node.js** >= 18 & **npm**
- **SQLite** (default) or MySQL / PostgreSQL

### Via Composer (Recommended)

The fastest way to get started. Composer will automatically copy the env file, generate the app key, run migrations with seeds, and create the storage symlink:

```bash
composer create-project tinymvc/orbit my-project
cd my-project
```

Then install frontend dependencies and build:

```bash
npm install
npm run dev      # Start Vite dev server
```

### Via Git Clone

```bash
git clone https://github.com/tinymvc/orbit.git my-project
cd my-project
```

Install PHP dependencies:

```bash
composer install
```

Set up the environment:

```bash
cp env.example.php env.php
```

Generate application key, create storage symlink, and run migrations with seed data:

```bash
php spark key:generate
php spark storage:link
php spark migrate --seed
```

Install frontend dependencies:

```bash
npm install
npm run dev      # Start Vite dev server (development)
```

---

## Configuration

The main configuration file is `env.php` in the project root. Key settings:

```php
return [
    'debug' => true,                        // Set to false in production
    'root_url' => 'http://localhost:8080',   // Your application URL
    'app_key' => '{APP_KEY}',               // Auto-generated via php spark key:generate
    'database' => require __DIR__ . '/config/database.php',
    'mail' => require __DIR__ . '/config/mail.php',
];
```

- **Database** — Configure in `config/database.php` (SQLite by default)
- **Mail** — Configure SMTP settings in `config/mail.php`
- **Permissions** — Define available permissions in `config/privileges.php`

---

## Running the Application

### Development

Start the PHP development server and Vite dev server in two terminals:

```bash
# Terminal 1 — PHP server
php spark serve

# Terminal 2 — Vite dev server (hot reload)
npm run dev
```

The application will be available at `http://localhost:8080`.

### Production

Build the frontend assets:

```bash
npm run build
```

Set `debug` to `false` in `env.php`, configure your `root_url`, and point your web server (Apache/Nginx) to the `public/` directory.

---

## Default Login Credentials

Navigate to `/admin` and log in with:

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `password` |

---

## Project Structure

```
orbit/
├── app/
│   ├── Http/
│   │   ├── Controllers/          # Application controllers
│   │   ├── Middlewares/          # HTTP middleware (auth, CSRF, CORS, etc.)
│   │   └── Resources/            # BREAD resource definitions ← your CRUD lives here
│   ├── Models/                   # Eloquent-style models
│   ├── Modules/
│   │   ├── Bread/                # BREAD engine (Resource, ResourceController, Form fields, Table columns)
│   │   └── Dashboard/            # Dashboard engine (Stats, Charts)
│   └── Providers/                # Service providers
├── bootstrap/                    # App bootstrapping & helpers
├── config/                       # App, database, mail, privileges config
├── database/
│   └── migrations/               # Database migrations & seeds
├── public/                       # Web root (index.php, compiled assets)
├── resources/
│   └── app/                      # React frontend application
│       ├── components/           # Reusable React components
│       ├── config/               # Menu & sidebar configuration
│       ├── layouts/              # Page layouts
│       ├── pages/                # Inertia page components
│       └── types/                # TypeScript type definitions
├── routes/
│   └── web.php                   # All route definitions
├── storage/                      # Logs, cache, uploads
├── env.php                       # Environment configuration
├── vite.config.ts                # Vite build configuration
└── spark                         # CLI tool (like artisan)
```

---

## BREAD Module

The BREAD (Browse, Read, Edit, Add, Delete) module is the heart of Orbit's admin interface. It lets you create fully functional CRUD interfaces by defining a **single PHP resource class** — no custom controllers, no custom React pages.

### How It Works

1. You create a **Resource class** (extends `App\Modules\Bread\Resource`)
2. Define your **form fields**, **table columns**, **filters**, and **bulk actions**
3. Register the route in `routes/web.php` with one line
4. Add a menu entry in the React sidebar config
5. Done — you get a complete CRUD interface with search, pagination, filtering, bulk actions, create/edit drawers, file uploads, relationships, and more.

### Creating a BREAD Resource

Use the built-in Spark command to generate a resource scaffold:

```bash
php spark make:bread Post
```

This creates `app/Http/Resources/PostsResource.php` with a ready-to-customize template.

You can also create resources in subdirectories:

```bash
php spark make:bread Blog/Post
```

This creates `app/Http/Resources/Blog/PostsResource.php`.

### Resource Configuration

Every resource has a set of static properties that control its behavior:

```php
<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Modules\Bread\Form;
use App\Modules\Bread\Resource;
use App\Modules\Bread\Table;

class ProductsResource extends Resource
{
    // ─── Core ───────────────────────────────────────────────────────────

    /** The Eloquent model this resource manages */
    protected static string $model = Product::class;

    /** Singular display name (shown in forms, flash messages) */
    protected static string $name = 'Product';

    /** URL slug — the resource will be accessible at /admin/products */
    protected static string $slug = 'products';

    /** Page title (defaults to pluralized $name if omitted) */
    protected static null|string $title = 'Products';

    /** Description shown below the page title */
    protected static null|string $description = 'Manage your product catalog.';

    /** Relationships to eager-load on the index query */
    protected static array $with = ['category:id,name'];

    /** Columns searchable via the search input */
    protected static array $searchable = ['name', 'sku', 'description'];

    /** Default sort column and direction */
    protected static string $orderBy = 'id';
    protected static string $orderDirection = 'desc';

    // ─── Drawer / Sheet ─────────────────────────────────────────────────

    /** Create/edit drawer width: sm | md | lg | xl | 2xl */
    protected static string $drawerWidth = 'lg';

    // ─── Disabled Features ──────────────────────────────────────────────

    /** Disable specific features: "search", "columns", "add_record" */
    protected static array $disabled = [];

    // ... fields(), columns(), etc.
}
```

### Form Fields

Form fields define the create/edit drawer interface. All fields use a fluent builder pattern.

#### Available Field Types

| Field Type | Class | Description |
|-----------|-------|-------------|
| **TextInput** | `Form\TextInput` | Text, email, password, number, URL, tel |
| **Textarea** | `Form\Textarea` | Multi-line text area |
| **Select** | `Form\Select` | Dropdown select (single or multi) |
| **Combobox** | `Form\Combobox` | Searchable select with relationship support |
| **SlugInput** | `Form\SlugInput` | Auto-generated slug from another field |
| **DatePicker** | `Form\DatePicker` | Date or date-time picker |
| **FileUpload** | `Form\FileUpload` | File/image upload with compression & resize |
| **RichEditor** | `Form\RichEditor` | Tiptap rich text editor |
| **Toggle** | `Form\Toggle` | Switch/toggle (boolean) |
| **Checkbox** | `Form\Checkbox` | Checkbox (boolean) |
| **Hidden** | `Form\Hidden` | Hidden field (not rendered, but submitted) |

#### Common Field Methods

Every field type inherits these methods from the base `Field` class:

```php
Form\TextInput::make('name')
    ->label('Display Name')           // Field label
    ->placeholder('Enter name...')    // Placeholder text
    ->required()                      // Mark as required (adds validation)
    ->description('Help text below')  // Help text / description
    ->default('Default value')        // Default value for create form
    ->columnSpan(2)                   // Span 2 columns (full-width in 2-col grid)
    ->fullWidth()                     // Alias for columnSpan(2)
    ->disabled()                      // Render as read-only
    ->createOnly()                    // Only show on create form
    ->editOnly()                      // Only show on edit form
    ->hidden()                        // Don't render (but include in data)
    ->visibleWhen(['status' => 'active']); // Conditional visibility
```

#### TextInput Examples

```php
// Simple text
Form\TextInput::make('name')->required()->maxLength(100)

// Email
Form\TextInput::make('email')->email()->required()

// Password
Form\TextInput::make('password')->password()->required()->createOnly()

// Number with range
Form\TextInput::make('price')->numeric()->min(0)->max(99999)->step(0.01)

// With uniqueness validation
Form\TextInput::make('email')->email()->unique('users,email')
```

#### SlugInput

Auto-generates a URL-friendly slug from another field:

```php
Form\SlugInput::make('slug')
    ->from('title')                    // Source field to generate slug from
    ->unique('posts,slug')             // Uniqueness validation (table,column)
    ->maxLength(255)
```

#### Select

```php
// Static options
Form\Select::make('status')
    ->required()
    ->default('draft')
    ->options([
        ['value' => 'draft',     'label' => 'Draft'],
        ['value' => 'published', 'label' => 'Published'],
        ['value' => 'archived',  'label' => 'Archived'],
    ])
    ->in('draft,published,archived')  // Validation: allowed values

// Dynamic options from server (via dynamicProps)
Form\Select::make('category_id')
    ->dynamicOptions('categories')
```

#### Combobox (Searchable Select)

The Combobox is the most powerful field type — it supports static options, AJAX search, `belongsTo`, and `belongsToMany` relationships:

```php
// Static searchable select
Form\Combobox::make('country')
    ->options([
        ['value' => 'us', 'label' => 'United States'],
        ['value' => 'uk', 'label' => 'United Kingdom'],
    ])

// BelongsTo relationship (single select, stores FK on the model)
Form\Combobox::make('user_id')
    ->belongsTo('user', 'id', 'display_name')
    ->searchRoute(self::getUrl())         // Enable AJAX search
    ->selectKeys(['id', 'first_name', 'last_name', 'username'])
    ->searchKeys(['first_name', 'last_name', 'username'])
    ->placeholder('Select author...')

// BelongsToMany relationship (multiple select, syncs pivot table)
Form\Combobox::make('categories')
    ->belongsToMany('categories', 'id', 'name')
    ->dynamicOptions('categories')        // Pre-loaded options
    ->placeholder('Select categories...')

// Taggable mode — create new options on the fly
Form\Combobox::make('tags')
    ->multiple()
    ->taggable()
    ->dynamicOptions('tags')
```

#### DatePicker

```php
// Date only
Form\DatePicker::make('published_at')

// Date + Time
Form\DatePicker::make('scheduled_at')
    ->withTime()
    ->disablePastDates()

// Disable future dates
Form\DatePicker::make('birth_date')
    ->disableFutureDates()
```

#### FileUpload

```php
Form\FileUpload::make('thumbnail')
    ->uploadTo('posts')                    // Upload directory (relative to storage/uploads/)
    ->acceptedTypes(['jpg', 'png', 'webp']) // Allowed extensions
    ->maxFileSize(4096)                    // Max size in KB (4MB)
    ->compress(80)                         // JPEG/WebP quality (1-100)
    ->resize(1200, 800)                    // Max width × height
    ->multiple()                           // Allow multiple files
```

#### RichEditor (Tiptap)

```php
Form\RichEditor::make('content')
    ->rows(12)                             // Editor height
    ->required()
    ->placeholder('Write your content...')
```

#### Toggle & Checkbox

```php
Form\Toggle::make('is_active')->label('Active')->default(true)
Form\Checkbox::make('is_featured')
```

### Table Columns

Table columns define how data appears in the browse table.

```php
public static function columns(): array
{
    return [
        // Basic text with click-to-edit and truncation
        Table\Column::make('title')
            ->clickToEdit()
            ->truncate(45),

        // Thumbnail image
        Table\Column::make('thumbnail')
            ->header('Image')
            ->thumbnail(),

        // Avatar column (circular image + name)
        Table\Column::make('user')
            ->header('Author')
            ->avatar('avatar_url')
            ->display(['display_name']),

        // Badge with color mapping
        Table\Column::make('status')
            ->badge()
            ->badgeMap([
                'draft'     => ['label' => 'Draft',     'variant' => 'secondary'],
                'published' => ['label' => 'Published', 'variant' => 'default'],
                'archived'  => ['label' => 'Archived',  'variant' => 'outline'],
            ]),

        // Tags (array of related items)
        Table\Column::make('categories')
            ->tags()
            ->display(['name'])
            ->limit(3),

        // Date formatting
        Table\Column::make('created_at')
            ->header('Created')
            ->date(),

        // Boolean column
        Table\Column::make('is_active')
            ->boolean(),

        // HTML content
        Table\Column::make('content')
            ->html()
            ->truncate(100),

        // Initially hidden (user can toggle via column visibility)
        Table\Column::make('excerpt')
            ->truncate(60)
            ->hidden(),
    ];
}
```

#### Column Types Reference

| Method | Description |
|--------|-------------|
| `->text()` | Plain text (default) |
| `->badge()` | Colored badge with `->badgeMap()` |
| `->date()` | Formatted date |
| `->image()` | Image with `->imageSize()` |
| `->thumbnail()` | Thumbnail card preview |
| `->avatar($field)` | Circular avatar + display name |
| `->tags()` | Array of items as badges |
| `->boolean()` | True/false indicator |
| `->html()` | Rendered HTML content |
| `->belongsTo()` | Related model display |

#### Column Modifiers

| Method | Description |
|--------|-------------|
| `->header('Label')` | Custom column header |
| `->clickToEdit()` | Click row to open edit drawer |
| `->truncate(50)` | Truncate text to N characters |
| `->hidden()` | Initially hidden (toggleable) |
| `->display(['field1', 'field2'])` | Fields to display (for relations) |
| `->limit(3)` | Max items to show (for tags) |
| `->className('text-red-500')` | Custom CSS class |
| `->accessor('user.name')` | Nested data accessor |

### Filters

Server-side filters appear as dropdowns above the table:

```php
public static function filters(): array
{
    return [
        // Simple column filter (WHERE status = ?)
        Table\Filter::make('status')
            ->label('Status')
            ->options([
                ['value' => 'draft',     'label' => 'Draft'],
                ['value' => 'published', 'label' => 'Published'],
            ]),

        // Dynamic options from server
        Table\Filter::make('category_id')
            ->label('Category')
            ->options('dynamic:categories'),

        // Custom filter callback (for complex queries)
        Table\Filter::make('category_id')
            ->label('Category')
            ->callback(function ($query, $value) {
                $query->whereHas('categories', fn($q) => $q->where('categories.id', (int) $value));
            })
            ->options('dynamic:categories'),
    ];
}
```

### Bulk Actions

Bulk actions appear when rows are selected:

```php
public static function bulkActions(): array
{
    return [
        // Status change actions (auto-updates the 'status' column)
        Table\BulkAction::make('published')->label('Publish Selected'),
        Table\BulkAction::make('draft')->label('Move to Draft'),
        Table\BulkAction::make('archived')->label('Archive Selected'),

        // Delete action (built-in, handles file cleanup)
        Table\BulkAction::make('delete')->label('Delete Selected')->destructive(),

        // Custom callback action
        Table\BulkAction::make('export')
            ->label('Export Selected')
            ->callback(function (array $ids) {
                // Custom logic here
            }),

        // Custom status column
        Table\BulkAction::make('inactive')
            ->label('Deactivate')
            ->statusColumn('is_active'),
    ];
}
```

You can also handle custom bulk actions in the resource:

```php
public static function handleBulkAction(string $action, array $ids)
{
    if ($action === 'export') {
        // ... custom logic
        return inertia()->back()->with('success', 'Exported!');
    }

    return null; // Fall through to default handling
}
```

### Permissions

Set permission requirements on each CRUD operation:

```php
protected static null|string $browsePerm = 'products.browse';
protected static null|string $createPerm = 'products.create';
protected static null|string $editPerm   = 'products.edit';
protected static null|string $deletePerm = 'products.delete';
```

Set to `null` to disable the permission check for that operation.

> **Don't forget** to register your permission keys in `config/privileges.php`:
>
> ```php
> return [
>     'products' => [
>         'browse' => 'View Products Table',
>         'create' => 'Create Products',
>         'edit'   => 'Edit Products',
>         'delete' => 'Delete Products',
>     ],
> ];
> ```

### Dynamic Props

Send additional data to the frontend (e.g., options for select/combobox fields):

```php
public static function dynamicProps(): array
{
    return [
        'categories' => Category::select(['id', 'name'])
            ->map(fn($c) => [
                'value' => (string) $c->id,
                'label' => $c->name,
            ])->all(...),
    ];
}
```

Fields reference these using `->dynamicOptions('categories')` or `->options('dynamic:categories')`.

### Lifecycle Hooks

Resources provide hooks to customize behavior at every stage:

```php
// Mutate data before creating a new record
public static function mutateBeforeCreate(array $data): array
{
    $data['user_id'] = auth()->id();
    return $data;
}

// Called after a record is created
public static function afterCreate($record, array $data): void
{
    // Send notification, dispatch job, etc.
}

// Mutate data before updating
public static function mutateBeforeUpdate(array $data, $record): array
{
    if (empty($data['published_at'])) {
        unset($data['published_at']);
    }
    return $data;
}

// Called after a record is updated
public static function afterUpdate($record, array $data): void {}

// Called before a record is deleted
public static function beforeDelete($record): void {}

// Custom validation rules (return null to auto-generate from fields)
public static function storeRules(): null|array
{
    return [
        'name' => 'required|max:100',
        'email' => 'required|email|unique:users,email',
    ];
}

public static function updateRules(int $id): null|array
{
    return [
        'name' => 'required|max:100',
        'email' => "required|email|unique:users,email,$id",
    ];
}
```

### File Uploads

File uploads are handled automatically when you use `Form\FileUpload`. The module:

- Processes uploads **before** validation
- Stores files in `storage/uploads/{uploadTo}/`
- Automatically **deletes old files** on update or record deletion
- Supports **compression** and **resizing** for images
- Supports **multiple file uploads**
- Makes files accessible via the `/uploads/` public URL

### Relationships

#### BelongsTo

For foreign key fields (e.g., a post belongs to a user):

```php
Form\Combobox::make('user_id')
    ->belongsTo('user', 'id', 'display_name')
    ->searchRoute(self::getUrl())
```

The `user_id` value is stored directly on the model.

#### BelongsToMany

For pivot table relationships (e.g., a post has many categories):

```php
Form\Combobox::make('categories')
    ->belongsToMany('categories', 'id', 'name')
    ->dynamicOptions('categories')
```

The BREAD module automatically calls `sync()` on the relationship after create/update.

### Registering Routes

In `routes/web.php`, register your resource with a single line inside the authenticated route group:

```php
use App\Http\Resources\ProductsResource;
use App\Modules\Bread\ResourceController;

Route::group(function () {
    // ... existing routes ...

    // Register BREAD routes for Products
    ResourceController::routes(ProductsResource::class);

})->middleware('auth')->prefix('admin');
```

This registers the following routes automatically:

| Method | URI | Action |
|--------|-----|--------|
| `GET` | `/admin/products` | Index (browse table) |
| `POST` | `/admin/products` | Store (create record) |
| `PUT` | `/admin/products/{id}` | Update (edit record) |
| `DELETE` | `/admin/products/{id}` | Destroy (delete record) |
| `POST` | `/admin/products/bulk-action` | Bulk action handler |
| `GET` | `/admin/products/search` | AJAX search (for Combobox) |

### Complete Resource Example

Here's a full real-world example — the Posts resource included with Orbit:

```php
<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Models\Post;
use App\Modules\Bread\Form;
use App\Modules\Bread\Resource;
use App\Modules\Bread\Table;

class PostsResource extends Resource
{
    protected static string $model = Post::class;
    protected static string $name = 'Post';
    protected static string $slug = 'posts';
    protected static null|string $title = 'Posts';
    protected static null|string $description = 'Manage blog posts, drafts, and scheduled publications.';

    protected static array $with = [
        'user:id,first_name,last_name,username,email',
        'categories:id,name',
    ];
    protected static array $searchable = ['title', 'slug', 'excerpt'];

    protected static null|string $browsePerm = 'posts.browse';
    protected static null|string $createPerm = 'posts.create';
    protected static null|string $editPerm   = 'posts.edit';
    protected static null|string $deletePerm = 'posts.delete';

    protected static string $drawerWidth = 'xl';

    public static function fields(): array
    {
        return [
            Form\TextInput::make('title')
                ->label('Title')->required()->maxLength(255)
                ->placeholder('Enter post title')->columnSpan(2),

            Form\SlugInput::make('slug')
                ->from('title')->label('Slug')->required()
                ->maxLength(255)->unique('posts,slug')
                ->description('URL-friendly version of the title.'),

            Form\Combobox::make('user_id')
                ->label('Author')->required()
                ->belongsTo('user', 'id', 'display_name')
                ->searchRoute(self::getUrl()),

            Form\Combobox::make('categories')
                ->label('Categories')
                ->belongsToMany('categories', 'id', 'name')
                ->dynamicOptions('categories'),

            Form\Select::make('status')
                ->label('Status')->required()->default('draft')
                ->options([
                    ['value' => 'draft',     'label' => 'Draft'],
                    ['value' => 'published', 'label' => 'Published'],
                    ['value' => 'archived',  'label' => 'Archived'],
                    ['value' => 'scheduled', 'label' => 'Scheduled'],
                ])->in('draft,published,archived,scheduled'),

            Form\DatePicker::make('published_at')
                ->withTime()->label('Published At')
                ->visibleWhen(['status' => 'published'])->fullWidth(),

            Form\FileUpload::make('thumbnail')
                ->label('Thumbnail')->uploadTo('posts')
                ->acceptedTypes(['jpg', 'jpeg', 'png', 'webp', 'gif'])
                ->maxFileSize(4096)->compress(80)->columnSpan(2),

            Form\Textarea::make('excerpt')
                ->label('Excerpt')->maxLength(500)->rows(3)->columnSpan(2),

            Form\RichEditor::make('content')
                ->label('Content')->rows(12)->columnSpan(2),
        ];
    }

    public static function columns(): array
    {
        return [
            Table\Column::make('title')->clickToEdit()->truncate(45),
            Table\Column::make('thumbnail')->header('Thumbnail')->thumbnail(),
            Table\Column::make('user')->header('Author')->avatar('avatar_url')->display(['display_name']),
            Table\Column::make('status')->badge()->badgeMap([
                'draft'     => ['label' => 'Draft',     'variant' => 'secondary'],
                'published' => ['label' => 'Published', 'variant' => 'default'],
                'archived'  => ['label' => 'Archived',  'variant' => 'outline'],
            ]),
            Table\Column::make('categories')->tags()->display(['name'])->limit(3),
            Table\Column::make('published_at')->header('Published')->date(),
            Table\Column::make('created_at')->header('Created')->hidden()->date(),
        ];
    }

    public static function filters(): array
    {
        return [
            Table\Filter::make('status')->label('Status')->options([
                ['value' => 'draft',     'label' => 'Draft'],
                ['value' => 'published', 'label' => 'Published'],
            ]),
            Table\Filter::make('category_id')->label('Category')
                ->callback(fn($query, $value) =>
                    $query->whereHas('categories', fn($q) => $q->where('categories.id', (int) $value))
                )->options('dynamic:categories'),
        ];
    }

    public static function bulkActions(): array
    {
        return [
            Table\BulkAction::make('published')->label('Publish Selected'),
            Table\BulkAction::make('draft')->label('Move to Draft'),
            Table\BulkAction::make('delete')->label('Delete Selected')->destructive(),
        ];
    }

    public static function dynamicProps(): array
    {
        return [
            'categories' => Category::select(['id', 'name'])
                ->map(fn($c) => ['value' => (string) $c->id, 'label' => $c->name])
                ->all(...),
        ];
    }

    public static function mutateBeforeCreate(array $data): array
    {
        if (empty($data['published_at'])) unset($data['published_at']);
        if (empty($data['scheduled_at'])) unset($data['scheduled_at']);
        return $data;
    }
}
```

---

## Dashboard Module

The Dashboard module provides a fluent PHP API for building analytics dashboards with stat cards and charts. The frontend renders everything automatically using Recharts.

### Stats Cards

Stats cards display key metrics at the top of the dashboard:

```php
use App\Modules\Dashboard\Stats;

Stats::make('Total Revenue')
    ->value('$1,250.00')       // Display value (formatted string)
    ->change(12.5)             // Percentage change
    ->trend('up')              // 'up' | 'down' | 'neutral'
    ->footer('Trending up this month')
    ->description('Revenue for the last 6 months');
```

### Charts

Six chart types are available, all sharing a common fluent API:

| Chart Type | Class | Best For |
|-----------|-------|---------|
| **BarChart** | `Charts\BarChart` | Comparing categories |
| **LineChart** | `Charts\LineChart` | Trends over time |
| **AreaChart** | `Charts\AreaChart` | Volume trends |
| **PieChart** | `Charts\PieChart` | Proportional distribution |
| **RadarChart** | `Charts\RadarChart` | Multi-axis comparison |
| **RadialChart** | `Charts\RadialChart` | Progress/gauge metrics |

#### Common Chart API

```php
use App\Modules\Dashboard\Charts\BarChart;

BarChart::make('Monthly Revenue')
    ->description('Revenue vs Expenses')     // Subtitle
    ->xAxisKey('month')                      // Category axis key
    ->dataKeys(['revenue', 'expenses'])      // Data series keys
    ->colors([                               // Colors per series
        'hsl(221, 83%, 53%)',
        'hsl(0, 84%, 60%)',
    ])
    ->colSpan(2)                             // Grid columns to span (1-3)
    ->height(350)                            // Chart height in pixels
    ->data([                                 // Data array
        ['month' => 'Jan', 'revenue' => 4000, 'expenses' => 2400],
        ['month' => 'Feb', 'revenue' => 3000, 'expenses' => 1398],
        ['month' => 'Mar', 'revenue' => 5000, 'expenses' => 3800],
    ]);
```

#### PieChart

```php
PieChart::make('Browser Share')
    ->dataKeys(['value'])
    ->colors(['hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(173, 58%, 39%)'])
    ->colSpan(1)
    ->data([
        ['name' => 'Chrome',  'value' => 62],
        ['name' => 'Safari',  'value' => 19],
        ['name' => 'Firefox', 'value' => 10],
    ]);
```

#### RadialChart (Gauge/Progress)

```php
RadialChart::make('Goal Completion')
    ->dataKeys(['value'])
    ->colors(['hsl(221, 83%, 53%)', 'hsl(173, 58%, 39%)'])
    ->colSpan(1)
    ->data([
        ['name' => 'Sales',     'value' => 78],
        ['name' => 'Support',   'value' => 92],
        ['name' => 'Marketing', 'value' => 65],
    ]);
```

### Date Range Picker

Enable a date range picker with quick presets:

```php
$dashboard = Dashboard::make('Dashboard')
    ->dateRange('/admin', [
        ['label' => '7D',  'days' => 7],
        ['label' => '14D', 'days' => 14],
        ['label' => '30D', 'days' => 30],
        ['label' => '90D', 'days' => 90],
    ])
    ->activeDateRange($request->input('from'), $request->input('to'));
```

The date range is sent as `?from=YYYY-MM-DD&to=YYYY-MM-DD` query parameters to the route.

### Dashboard Controller Example

```php
<?php

namespace App\Http\Controllers;

use App\Modules\Dashboard\Dashboard;
use App\Modules\Dashboard\Stats;
use App\Modules\Dashboard\Charts\AreaChart;
use App\Modules\Dashboard\Charts\BarChart;
use App\Modules\Dashboard\Charts\PieChart;
use Spark\Http\Request;

class DashboardController extends Controller
{
    public function overview(Request $request)
    {
        $from = $request->input('from');
        $to   = $request->input('to');

        // Fetch your real data based on $from / $to date range
        $dashboard = Dashboard::make('Dashboard', 'Your analytics overview at a glance.')
            ->dateRange('/admin', [
                ['label' => '7D', 'days' => 7],
                ['label' => '30D', 'days' => 30],
                ['label' => '90D', 'days' => 90],
            ])
            ->activeDateRange($from, $to)
            ->stats([
                Stats::make('Total Revenue')
                    ->value('$1,250.00')
                    ->change(12.5)
                    ->trend('up')
                    ->footer('Trending up this month'),

                Stats::make('New Customers')
                    ->value('1,234')
                    ->change(-20)
                    ->trend('down')
                    ->footer('Down 20% this period'),
            ])
            ->charts([
                BarChart::make('Monthly Revenue')
                    ->xAxisKey('month')
                    ->dataKeys(['revenue', 'expenses'])
                    ->colors(['hsl(221, 83%, 53%)', 'hsl(0, 84%, 60%)'])
                    ->colSpan(2)->height(350)
                    ->data([
                        ['month' => 'Jan', 'revenue' => 4000, 'expenses' => 2400],
                        ['month' => 'Feb', 'revenue' => 3000, 'expenses' => 1398],
                    ]),

                PieChart::make('Browser Share')
                    ->dataKeys(['value'])
                    ->colors(['hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)'])
                    ->colSpan(1)->height(350)
                    ->data([
                        ['name' => 'Chrome', 'value' => 62],
                        ['name' => 'Safari', 'value' => 19],
                    ]),
            ]);

        return inertia('admin/dashboard', [
            'dashboard' => $dashboard->toArray(),
        ]);
    }
}
```

---

## Sidebar Menu Configuration

The sidebar navigation is configured in `resources/app/config/menu.ts`. Import Lucide icons and define your menu structure:

```typescript
// resources/app/config/menu.ts
import { MenuItem } from "@/types/context";
import { Users, CircleGauge, Rss, Package } from "lucide-react";

export const navMain: MenuItem[] = [
  // Simple link
  {
    title: "Dashboard",
    url: "/admin",
    icon: CircleGauge,
    permission: ["dashboard.overview"],
  },

  // Simple link
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    permission: ["users.browse"],
  },

  // Collapsible group with sub-items
  {
    title: "Posts",
    icon: Rss,
    permission: ["posts.browse"],
    items: [
      {
        title: "All Posts",
        url: "/admin/posts",
      },
      {
        title: "Categories",
        url: "/admin/categories",
      },
    ],
  },

  // Adding a new menu item for your resource
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
    permission: ["products.browse"],
  },
];

// Secondary navigation (bottom of sidebar)
export const navSecondary: MenuItem[] = [];

// These pages don't show in the sidebar but need breadcrumb support
export const breadcrumbSupport: MenuItem[] = [
  {
    title: "Profile",
    url: "/admin/profile",
  },
  {
    title: "Roles",
    url: "/admin/roles",
  },
];
```

### MenuItem Interface

```typescript
interface MenuItem {
  title: string;           // Display label
  url?: string;            // Route URL (omit for parent-only groups)
  icon?: LucideIcon;       // Lucide icon component
  permission?: string[];   // Required permissions (user needs at least one)
  items?: SubMenuItem[];   // Collapsible sub-items
}

interface SubMenuItem {
  title: string;
  url: string;
  permission?: string[];
}
```

### Sidebar Appearance

Customize the sidebar in `resources/app/config/sidebar.ts`:

```typescript
export const sidebarConfig = {
  collapsible: "icon",      // "offcanvas" | "icon" | "none"
  variant: "inset",         // "sidebar" | "floating" | "inset"
};

export const siteIdentity = {
  home_url: "/admin",
  name: "My App",
  icon: Eclipse,            // Lucide icon
  image: null,              // Or a URL to a logo image
};
```

---

## Permissions & Privileges

Permission keys are defined in `config/privileges.php`:

```php
<?php

return [
    'dashboard' => [
        'overview' => 'View Dashboard Overview',
    ],
    'roles' => [
        'browse' => 'View Roles Table',
        'create' => 'Create Roles',
        'edit'   => 'Edit Roles',
        'delete' => 'Delete Roles',
    ],
    'users' => [
        'browse' => 'View Users Table',
        'create' => 'Create Users',
        'edit'   => 'Edit Users',
        'delete' => 'Delete Users',
    ],
    'posts' => [
        'browse' => 'View Posts Table',
        'create' => 'Create Posts',
        'edit'   => 'Edit Posts',
        'delete' => 'Delete Posts',
    ],
    // Add your resource permissions here
    'products' => [
        'browse' => 'View Products Table',
        'create' => 'Create Products',
        'edit'   => 'Edit Products',
        'delete' => 'Delete Products',
    ],
];
```

These keys are referenced in:
- **Resource classes** via `$browsePerm`, `$createPerm`, `$editPerm`, `$deletePerm`
- **Menu items** via the `permission` array
- **Frontend** via the `can()` / `cannot()` helpers from the app context

---

## Available Spark Commands

| Command | Description |
|---------|-------------|
| `php spark serve` | Start the development server |
| `php spark key:generate` | Generate the application encryption key |
| `php spark migrate` | Run database migrations |
| `php spark migrate --seed` | Run migrations with seed data |
| `php spark migrate:fresh --seed` | Re-Run migrations with seed data |
| `php spark storage:link` | Create a symbolic link for public storage |
| `php spark make:bread {Name}` | Generate a new BREAD resource |

---

## Quick Start Checklist

Here's the step-by-step to add a new CRUD resource (e.g., **Products**):

1. **Create the model** — Define your `Product` model in `app/Models/Product.php`
2. **Create a migration** — Add a migration in `database/migrations/`
3. **Generate the resource** — Run `php spark make:bread Product`
4. **Customize the resource** — Edit `app/Http/Resources/ProductsResource.php` (fields, columns, filters, etc.)
5. **Register the route** — Add `ResourceController::routes(ProductsResource::class);` to the auth group in `routes/web.php`
6. **Add permissions** — Add a `products` section in `config/privileges.php`
7. **Add the menu item** — Add an entry in `resources/app/config/menu.ts`
8. **Run migrations** — `php spark migrate`
9. **Done!** — Visit `/admin/products`

---

## License

Orbit is open-source software licensed under the [MIT License](LICENSE).

Created by [Shahin Moyshan](https://github.com/shahinmoyshan).
