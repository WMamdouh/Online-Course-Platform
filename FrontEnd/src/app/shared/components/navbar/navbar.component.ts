import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  mobileOpen = signal(false);

  constructor(public auth: AuthService, private router: Router) {}

  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile()  { this.mobileOpen.set(false); }

  logout() {
    this.auth.logout().subscribe({
      error: () => {
        // Even if API fails, clear local session
        this.auth.clearSession();
        this.router.navigate(['/login']);
      }
    });
    this.closeMobile();
  }

  getDashboardRoute(): string {
    const role = this.auth.currentUser()?.role;
    if (role === 'student')    return '/dashboard/student';
    if (role === 'instructor') return '/dashboard/instructor';
    if (role === 'admin')      return '/admin/users';
    return '/courses';
  }
}
