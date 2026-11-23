<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** رسالة من نموذج «تواصل معنا». ليست محتوى منشوراً — لا مخبأ ولا ترجمة. */
class ContactMessage extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'message', 'locale', 'ip_hash', 'read_at'];

    protected function casts(): array
    {
        return ['read_at' => 'datetime'];
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
