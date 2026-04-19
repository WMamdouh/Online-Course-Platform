import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  errorMsg = '';
  loading  = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // Already logged in → redirect
    if (this.auth.isLoggedIn()) this.redirectByRole();
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading  = true;
    this.errorMsg = '';

    this.auth.login(this.email.value!, this.password.value!).subscribe({
      next:  () => this.redirectByRole(),
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  private redirectByRole() {
    const role = this.auth.currentUser()?.role;
    if (role === 'student')    this.router.navigate(['/dashboard/student']);
    else if (role === 'instructor') this.router.navigate(['/dashboard/instructor']);
    else                       this.router.navigate(['/admin/users']);
  }
}
