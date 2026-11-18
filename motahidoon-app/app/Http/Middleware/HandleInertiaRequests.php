<?php

namespace App\Http\Middleware;

use App\Services\SiteContent;
use Illuminate\Http\Request;
use Inertia\Middleware;

final class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'site';

    public function __construct(private readonly SiteContent $content) {}

    /**
     * ما تحتاجه الترويسة والتذييل في كل صفحة — لا الشجرة كلها.
     * إرسال 38 كيلوبايت مع كل تنقّل هدر؛ كل صفحة تطلب شريحتها.
     *
     * @return array<string, mixed>
     */
    /** اللوحة لها قالبها الجذر (Tailwind، بلا وسوم og:) والموقع قالبه. */
    public function rootView(Request $request): string
    {
        return $this->isAdmin($request) ? 'admin' : 'site';
    }

    public function share(Request $request): array
    {
        if ($this->isAdmin($request)) {
            return array_merge(parent::share($request), $this->adminProps($request));
        }

        return array_merge(parent::share($request), [
            'locale'      => app()->getLocale(),
            'locales'     => SetLocale::LOCALES,
            'ui'          => $this->content->ui(),
            'unapproved'  => $this->content->unapprovedNotice(),
            'org'         => $this->content->get('org'),
            'contact'     => $this->content->get('contact'),
            'donors'      => $this->content->get('donors'),
            'mediaOffice' => $this->content->get('mediaOffice'),
            'footerData'  => $this->footerData(),
        ]);
    }

    private function isAdmin(Request $request): bool
    {
        return $request->is('admin', 'admin/*');
    }

    /** ما تحتاجه كل صفحات اللوحة: المستخدم ودوره، ورسائل النجاح. @return array<string, mixed> */
    private function adminProps(Request $request): array
    {
        $user = $request->user();

        return [
            'auth' => $user === null ? null : [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ],
            'flash' => ['success' => $request->session()->get('success')],
        ];
    }

    /** @return array<string, mixed> */
    private function footerData(): array
    {
        $current = collect($this->content->get('reports.items'))
            ->firstWhere('id', $this->content->get('reports.current'));

        return [
            'pillars' => collect($this->content->get('pillars'))
                ->map(fn (array $p) => ['id' => $p['id'], 'short' => $p['short']])
                ->all(),
            'partners' => collect($this->content->get('partners'))
                ->map(fn (array $p) => ['name' => $p['name']])
                ->all(),
            'current' => $current === null ? null : [
                'label'       => $current['label'],
                'range'       => $current['range'],
                'reportTitle' => $current['reportTitle'],
            ],
        ];
    }
}
