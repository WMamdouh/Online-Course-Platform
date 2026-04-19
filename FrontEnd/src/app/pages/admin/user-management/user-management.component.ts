import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users:    User[] = [];
  total   = 0;
  page    = 1;
  pages   = 1;
  loading  = true;
  errorMsg = '';
  successMsg = '';

  // Create user modal
  showModal = false;
  createForm = this.fb.group({
    name:     ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role:     ['student', Validators.required],
    bio:      ['']
  });
  createLoading = false;
  createError   = '';

  constructor(
    public  auth: AuthService,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.userService.getAllUsers(this.page).subscribe({
      next: res => {
        this.users   = res.users;
        this.total   = res.total;
        this.pages   = res.pages;
        this.loading = false;
      },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load users.'; }
    });
  }

  goToPage(p: number) { this.page = p; this.load(); }

  deleteUser(user: User) {
    if (!confirm(`Delete user "${user.name}"?`)) return;
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.users      = this.users.filter(u => u._id !== user._id);
        this.successMsg = 'User deleted.';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: err => { this.errorMsg = err.error?.message || 'Delete failed.'; }
    });
  }

  openModal()  { this.showModal = true; this.createError = ''; this.createForm.reset({ role: 'student' }); }
  closeModal() { this.showModal = false; }

  submitCreate() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.createLoading = true;
    this.createError   = '';

    const data = this.createForm.value as any;
    this.userService.createUser(data).subscribe({
      next: res => {
        this.users.unshift(res.user);
        this.createLoading = false;
        this.successMsg    = `User "${res.user.name}" created.`;
        this.closeModal();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: err => {
        this.createLoading = false;
        this.createError   = err.error?.message || 'Create failed.';
      }
    });
  }

  getRoleBadge(role: string): string {
    if (role === 'admin')      return 'badge-red';
    if (role === 'instructor') return 'badge-blue';
    return 'badge-green';
  }

  totalPages(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }
}
