<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function __invoke(DashboardService $dashboard): Response
    {
        return Inertia::render('Admin/Dashboard', $dashboard->summary());
    }
}
