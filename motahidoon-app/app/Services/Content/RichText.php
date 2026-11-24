<?php

namespace App\Services\Content;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/**
 * النصّ المنسَّق القادم من محرّر اللوحة.
 *
 * قائمة سماح لا قائمة منع: كل وسم أو سمة لم تُذكر هنا تُحذف، وكل style
 * يمرّ على RichTextStyle. لا data: ولا javascript: في الروابط والصور.
 *
 * النصّ العادي بلا وسوم يمرّ حرفياً: محتوى المرحلة أ المنقول لا يُلفّ ولا
 * يُعاد ترميزه، فبصمة verify-strings لا تتغيّر لما لم يُحرَّر.
 * الواجهة تقرّر بالقاعدة نفسها (isHtml) أيّ قيمة تُرسَم HTML — غيّرهما معاً
 * (resources/js/lib/rich.ts).
 */
final class RichText
{
    private const HTML_START = '/^\s*<(p|h[1-6]|ul|ol|blockquote|table|div|figure|img|hr|pre)[\s>\/]/i';

    private static ?HtmlSanitizer $sanitizer = null;

    public static function isHtml(?string $value): bool
    {
        return $value !== null && preg_match(self::HTML_START, $value) === 1;
    }

    /** محرّر فارغ يُخرج <p></p>؛ يُعامَل فراغاً فيبقى الحقل null — خانة محجوزة. */
    public static function isBlank(?string $value): bool
    {
        if ($value === null) {
            return true;
        }
        $text = html_entity_decode(strip_tags($value, '<img><hr>'), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim(str_replace("\u{00A0}", ' ', $text)) === '';
    }

    public static function clean(?string $value): ?string
    {
        if ($value === null || ! self::isHtml($value)) {
            return $value;
        }
        $out = trim(self::sanitizer()->sanitize($value));

        return self::isBlank($out) ? null : $out;
    }

    /**
     * يطبّق $fn على كل قيمة في المسارات النقطية، و«*» يعني كل عنصر.
     *
     * @param  array<string, mixed>  $data
     * @param  list<string>  $paths  مثل groups.*.items.*.body
     * @return array<string, mixed>
     */
    public static function mapPaths(array $data, array $paths, callable $fn): array
    {
        foreach ($paths as $path) {
            $data = self::mapAt($data, explode('.', $path), $fn);
        }

        return $data;
    }

    private static function mapAt(mixed $node, array $segs, callable $fn): mixed
    {
        if ($segs === []) {
            return is_string($node) ? $fn($node) : $node;
        }
        if (! is_array($node)) {
            return $node;
        }
        $seg = array_shift($segs);
        if ($seg === '*') {
            foreach ($node as $k => $v) {
                $node[$k] = self::mapAt($v, $segs, $fn);
            }
        } elseif (array_key_exists($seg, $node)) {
            $node[$seg] = self::mapAt($node[$seg], $segs, $fn);
        }

        return $node;
    }

    private static function sanitizer(): HtmlSanitizer
    {
        if (self::$sanitizer !== null) {
            return self::$sanitizer;
        }

        $block = ['style', 'dir'];
        $config = (new HtmlSanitizerConfig)
            ->allowElement('p', $block)
            ->allowElement('h2', $block)
            ->allowElement('h3', $block)
            ->allowElement('h4', $block)
            ->allowElement('blockquote', $block)
            ->allowElement('br')
            ->allowElement('hr')
            ->allowElement('strong')
            ->allowElement('b')
            ->allowElement('em')
            ->allowElement('i')
            ->allowElement('u')
            ->allowElement('s')
            ->allowElement('sub')
            ->allowElement('sup')
            ->allowElement('span', ['style'])
            ->allowElement('mark', ['style', 'data-color'])
            ->allowElement('ul', ['style'])
            ->allowElement('ol', ['style', 'start', 'type'])
            ->allowElement('li', ['style'])
            ->allowElement('a', ['href', 'target', 'rel'])
            ->allowElement('table', ['style'])
            ->allowElement('colgroup')
            ->allowElement('col', ['style', 'span'])
            ->allowElement('thead')
            ->allowElement('tbody')
            ->allowElement('tfoot')
            ->allowElement('tr')
            ->allowElement('th', ['style', 'colspan', 'rowspan', 'colwidth'])
            ->allowElement('td', ['style', 'colspan', 'rowspan', 'colwidth'])
            ->allowElement('img', ['src', 'alt', 'width', 'height', 'style'])
            /* وسوم يُفكّ غلافها ويبقى نصّها: لصق Word والمواقع يحملها، وحذفها
               بمحتواها يُسقط أرقاماً وجملاً منشورة بصمت */
            ->blockElement('font')
            ->blockElement('div')
            ->blockElement('section')
            ->blockElement('article')
            ->blockElement('center')
            ->blockElement('small')
            ->blockElement('big')
            ->blockElement('ins')
            ->blockElement('del')
            ->blockElement('abbr')
            ->blockElement('cite')
            ->blockElement('code')
            ->blockElement('pre')
            ->blockElement('label')
            ->blockElement('figure')
            ->blockElement('figcaption')
            ->blockElement('caption')
            ->blockElement('h1')
            ->blockElement('h5')
            ->blockElement('h6')
            ->blockElement('dl')
            ->blockElement('dt')
            ->blockElement('dd')
            ->blockElement('o:p')
            ->allowLinkSchemes(['https', 'http', 'mailto', 'tel'])
            ->allowRelativeLinks()
            ->allowMediaSchemes(['https', 'http'])
            ->allowRelativeMedias()
            ->forceAttribute('a', 'rel', 'noopener noreferrer')
            ->withAttributeSanitizer(new RichTextStyle)
            ->withMaxInputLength(1_000_000);

        return self::$sanitizer = new HtmlSanitizer($config);
    }
}
