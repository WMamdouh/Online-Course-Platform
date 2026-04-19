import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/models';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './instructor-dashboard.component.html',
  styleUrl: './instructor-dashboard.component.css'
})
export class InstructorDashboardComponent implements OnInit {
  courses:  Course[] = [];
  loading  = true;
  errorMsg = '';
  deleteMsg = '';

  constructor(public auth: AuthService, private courseService: CourseService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.courseService.getMyCourses().subscribe({
      next: res => { this.courses = res.courses; this.loading = false; },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load courses.'; }
    });
  }

  deleteCourse(course: Course) {
    if (!confirm(`Delete "${course.title}"? This will also delete all lessons.`)) return;
    this.courseService.deleteCourse(course._id).subscribe({
      next: () => {
        this.courses  = this.courses.filter(c => c._id !== course._id);
        this.deleteMsg = 'Course deleted.';
        setTimeout(() => this.deleteMsg = '', 3000);
      },
      error: err => { this.deleteMsg = err.error?.message || 'Delete failed.'; }
    });
  }

  publishedCount(): number  { return this.courses.filter(c => c.isPublished).length; }
  draftCount(): number      { return this.courses.filter(c => !c.isPublished).length; }
  avgRating(): number {
    const rated = this.courses.filter(c => c.averageRating > 0);
    if (!rated.length) return 0;
    return +(rated.reduce((s, c) => s + c.averageRating, 0) / rated.length).toFixed(1);
  }
}
