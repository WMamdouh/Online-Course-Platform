import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Enrollment, Course } from '../../../core/models/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  enrollments: Enrollment[] = [];
  loading  = true;
  errorMsg = '';

  constructor(public auth: AuthService, private userService: UserService) {}

  ngOnInit() {
    const id = this.auth.currentUser()?._id;
    if (!id) return;

    this.userService.getUserEnrollments(id).subscribe({
      next: res => {
        this.enrollments = res.enrollments;
        this.loading     = false;
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Failed to load enrollments.';
      }
    });
  }

  getCourse(e: Enrollment): Course | null {
    return typeof e.course === 'object' ? e.course as Course : null;
  }

  getInProgressCount(): number {
    return this.enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
  }

  getCompletedCount(): number {
    return this.enrollments.filter(e => e.progressPercent === 100).length;
  }
}
