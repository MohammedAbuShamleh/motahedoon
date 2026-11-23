<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\VisitStats;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** صفحة الإحصاءات: الزيارات والزوّار يومياً، والصفحات، والأقسام، واللغات. */
final class StatsController extends Controller
{
    public function index(Request $request, VisitStats $stats): Response
    {
        $days = in_array((int) $request->query('days'), [7, 30, 90, 365], true) ? (int) $request->query('days') : 30;

        return Inertia::render('Admin/Stats/Index', ['stats' => $stats->summary($days)]);
    }
}
