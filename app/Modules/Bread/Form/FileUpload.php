<?php

namespace App\Modules\Bread\Form;

/**
 * File upload field — handles image and document uploads.
 *
 * @example
 *   FileUpload::make('thumbnail')
 *       ->uploadTo('posts')
 *       ->acceptedTypes(['jpg', 'jpeg', 'png', 'webp', 'gif'])
 *       ->maxFileSize(4096)
 *       ->compress(80)
 *
 *   FileUpload::make('document')
 *       ->uploadTo('documents')
 *       ->acceptedTypes(['pdf', 'docx'])
 *       ->maxFileSize(10240)
 */
class FileUpload extends Field
{
    protected ?string $uploadTo = null;
    protected array $accepted = [];
    protected ?int $maxFileSize = null;
    protected ?int $compressQuality = null;
    protected ?array $resizeDimensions = null;
    protected ?string $mediaUrl = null;

    public static function make(string $name): static
    {
        return new static($name);
    }

    public function getType(): string
    {
        return 'file';
    }

    // ─── Overrides ──────────────────────────────────────────────────────

    public function isFileUpload(): bool
    {
        return true;
    }

    public function getUploadTo(): ?string
    {
        return $this->uploadTo;
    }

    public function getAcceptedTypes(): array
    {
        return $this->accepted;
    }

    public function getMaxFileSize(): ?int
    {
        return $this->maxFileSize;
    }

    public function getCompress(): ?int
    {
        return $this->compressQuality;
    }

    public function getResize(): ?array
    {
        return $this->resizeDimensions;
    }

    // ─── Property Setters ───────────────────────────────────────────────

    /**
     * Upload directory relative to storage/uploads/.
     */
    public function uploadTo(string $dir): static
    {
        $this->uploadTo = $dir;
        return $this;
    }

    /**
     * Accepted file extensions.
     *
     * @param string[] $types e.g. ['jpg', 'png', 'webp']
     */
    public function acceptedTypes(array $types): static
    {
        $this->accepted = $types;
        return $this;
    }

    /**
     * Maximum file size in kilobytes.
     */
    public function maxFileSize(int $kb): static
    {
        $this->maxFileSize = $kb;
        return $this;
    }

    /**
     * JPEG/WebP compression quality (1-100).
     */
    public function compress(int $quality): static
    {
        $this->compressQuality = $quality;
        return $this;
    }

    /**
     * Resize to max width × height.
     */
    public function resize(int $width, int $height): static
    {
        $this->resizeDimensions = [$width, $height];
        return $this;
    }

    /**
     * Base media URL prefix (defaults to /uploads/).
     */
    public function mediaUrl(string $url): static
    {
        $this->mediaUrl = $url;
        return $this;
    }

    // ─── Serialisation ──────────────────────────────────────────────────

    public function toArray(): array
    {
        $arr = parent::toArray();

        if ($this->uploadTo !== null)
            $arr['uploadTo'] = $this->uploadTo;
        if (!empty($this->accepted))
            $arr['acceptedTypes'] = $this->accepted;
        if ($this->maxFileSize !== null)
            $arr['maxFileSize'] = $this->maxFileSize;
        if ($this->compressQuality !== null)
            $arr['compress'] = $this->compressQuality;
        if ($this->resizeDimensions !== null)
            $arr['resize'] = $this->resizeDimensions;
        if ($this->mediaUrl !== null)
            $arr['mediaUrl'] = $this->mediaUrl;

        return $arr;
    }

    public function toValidationRule(?int $recordId = null): ?string
    {
        // File upload validation is handled separately by processFileUploads
        return $this->required ? 'required' : 'nullable';
    }
}
