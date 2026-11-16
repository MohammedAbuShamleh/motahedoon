<?php

namespace App\Services;

use App\Contracts\ContentSource;
use RuntimeException;

/**
 * يقرأ resources/content/*.json التي يولّدها tools/export-content.mjs.
 *
 * مؤقّت بحكم المرحلة أ، ومع ذلك يُحمَّل مرّة واحدة لكل طلب: الملفات
 * ثابتة والقراءة من القرص لا تتكرّر.
 */
final class JsonContentSource implements ContentSource
{
    /** @var array<string, array|null> */
    private array $cache = [];

    public function __construct(private readonly string $dir) {}

    public function base(): array
    {
        $data = $this->read('site.ar');

        if ($data === null) {
            throw new RuntimeException(
                'ملف المحتوى العربي مفقود. شغّل: node tools/export-content.mjs'
            );
        }

        return $data;
    }

    public function overlay(string $locale): ?array
    {
        return $locale === 'ar' ? null : $this->read("site.{$locale}");
    }

    private function read(string $name): ?array
    {
        if (array_key_exists($name, $this->cache)) {
            return $this->cache[$name];
        }

        $path = "{$this->dir}/{$name}.json";
        $raw = is_file($path) ? file_get_contents($path) : false;

        return $this->cache[$name] = $raw === false
            ? null
            : json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    }
}
