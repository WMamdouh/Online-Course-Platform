import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // ── Reactive state using Angular signals ──────────────────────────────────
  currentUser  = signal<User | null>(null);
  accessToken  = signal<string | null>(null);

  // Computed helpers used in templates and guards
  isLoggedIn   = computed(() => !!this.accessToken());
  isStudent    = computed(() => this.currentUser()?.role === 'student');
  isInstructor = computed(() => this.currentUser()?.role === 'instructor');
  isAdmin      = computed(() => this.currentUser()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {
    // Restore session from localStorage when the app loads
    this.restoreSession();
  }

  // ── Restore session from localStorage ────────────────────────────────────
  private restoreSession(): void {
    const token = localStorage.getItem('accessToken');
    const user  = localStorage.getItem('currentUser');
    if (token && user) {
      try {
        this.accessToken.set(token);
        this.currentUser.set(JSON.parse(user));
      } catch {
        this.clearSession();
      }
    }
  }

  // ── Clear localStorage and signals ───────────────────────────────────────
  clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.accessToken.set(null);
    this.currentUser.set(null);
  }

  // ── API calls ─────────────────────────────────────────────────────────────

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true } // sends/receives the httpOnly refreshToken cookie
    ).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.accessToken.set(response.accessToken);
        this.currentUser.set(response.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`, {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      })
    );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(
      `${this.apiUrl}/refresh`, {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        this.accessToken.set(response.accessToken);
      })
    );
  }

  getMe(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`);
  }

  // ── Role helper ───────────────────────────────────────────────────────────
  hasRole(...roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }
}
