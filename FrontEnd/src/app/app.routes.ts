import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/guards';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/courses', pathMatch: 'full' },

  // ── Public ──────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // ── Courses (public browse) ──────────────────────────────────────────────
  {
    path: 'courses',
    loadComponent: () =>
      import('./pages/courses/course-list/course-list.component').then(m => m.CourseListComponent)
  },
  {
    path: 'courses/new',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['instructor', 'admin'] },
    loadComponent: () =>
      import('./pages/courses/course-form/course-form.component').then(m => m.CourseFormComponent)
  },
  {
    path: 'courses/:id/edit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['instructor', 'admin'] },
    loadComponent: () =>
      import('./pages/courses/course-form/course-form.component').then(m => m.CourseFormComponent)
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./pages/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
  },

  // ── Lessons ──────────────────────────────────────────────────────────────
  {
    path: 'courses/:courseId/lessons/new',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['instructor', 'admin'] },
    loadComponent: () =>
      import('./pages/lessons/lesson-form/lesson-form.component').then(m => m.LessonFormComponent)
  },
  {
    path: 'courses/:courseId/lessons/:lessonId/edit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['instructor', 'admin'] },
    loadComponent: () =>
      import('./pages/lessons/lesson-form/lesson-form.component').then(m => m.LessonFormComponent)
  },
  {
    path: 'courses/:courseId/lessons/:lessonId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/lessons/lesson-detail/lesson-detail.component').then(m => m.LessonDetailComponent)
  },

  // ── Dashboards ────────────────────────────────────────────────────────────
  {
    path: 'dashboard/student',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
    loadComponent: () =>
      import('./pages/dashboard/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
  },
  {
    path: 'dashboard/instructor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['instructor', 'admin'] },
    loadComponent: () =>
      import('./pages/dashboard/instructor-dashboard/instructor-dashboard.component').then(m => m.InstructorDashboardComponent)
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./pages/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
  },

  // ── Catch-all ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '/courses' }
];
