<?php

namespace App\Models;

use App\Enums\SocialPlatform;
use App\Traits\FlushesContentCache;
use App\Traits\HasPosition;
use Illuminate\Database\Eloquent\Model;

/** رابط تواصل اجتماعي في التذييل. لا ترجمة: الرابط واحد في كلّ لغة. */
class SocialLink extends Model
{
    use FlushesContentCache, HasPosition;

    protected $fillable = ['platform', 'url', 'label', 'position', 'is_published'];

    protected function casts(): array
    {
        return ['platform' => SocialPlatform::class, 'position' => 'integer', 'is_published' => 'boolean'];
    }
}
