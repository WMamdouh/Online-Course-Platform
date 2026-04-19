import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/models/models';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CourseCardComponent, PaginationComponent],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css'
})
export class CourseListComponent implements OnInit {
  courses:  Course[] = [];
  total   = 0;
  page    = 1;
  pages   = 1;
  limit   = 9;
  search  = '';
  category = '';
  loading  = false;
  errorMsg = '';

  readonly categories = [
    'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'Design', 'DevOps', 'Cybersecurity',
    'Business', 'Marketing', 'Photography'
  ];

  constructor(public auth: AuthService, private courseService: CourseService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading  = true;
    this.errorMsg = '';
    this.courseService.getCourses({
      page: this.page, limit: this.limit,
      search:   this.search   || undefined,
      category: this.category || undefined
    }).subscribe({
      next: res => {
        this.courses = res.courses;
        this.total   = res.total;
        this.pages   = res.pages;
        this.loading = false;
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Failed to load courses. Please try again.';
      }
    });
  }

  onSearch()  { this.page = 1; this.load(); }
  onFilter()  { this.page = 1; this.load(); }
  clearSearch() { this.search = ''; this.category = ''; this.page = 1; this.load(); }
  goToPage(p: number) { this.page = p; this.load(); }
}
