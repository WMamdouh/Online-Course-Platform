import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form = this.fb.group({
    name:     ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  successMsg = '';
  errorMsg   = '';
  loading    = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  get name()     { return this.form.get('name')!; }
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading   = true;
    this.errorMsg  = '';
    this.successMsg = '';

    this.auth.register({
      name:     this.name.value!,
      email:    this.email.value!,
      password: this.password.value!
    }).subscribe({
      next: () => {
        this.loading     = false;
        this.successMsg  = 'Account created! Redirecting to login…';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
