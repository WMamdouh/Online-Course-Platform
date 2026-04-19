import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.css'
})
export class CourseFormComponent implements OnInit {
  form = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    category:    ['', [Validators.required]],
    price:       [0,  [Validators.min(0)]],
    isPublished: [false],
    thumbnail:   ['']
  });

  isEdit   = false;
  courseId = '';
  loading  = false;
  errorMsg = '';
  successMsg = '';

  readonly categories = [
    'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'Design', 'DevOps', 'Cybersecurity',
    'Business', 'Marketing', 'Photography'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit   = !!this.courseId;

    if (this.isEdit) {
      // Load existing course data for editing
      this.courseService.getCourseById(this.courseId).subscribe({
        next: res => {
          const c = res.course;
          this.form.patchValue({
            title:       c.title,
            description: c.description,
            category:    c.category,
            price:       c.price,
            isPublished: c.isPublished,
            thumbnail:   c.thumbnail || ''
          });
        },
        error: () => { this.errorMsg = 'Failed to load course.'; }
      });
    }
  }

  get title()       { return this.form.get('title')!; }
  get description() { return this.form.get('description')!; }
  get category()    { return this.form.get('category')!; }
  get price()       { return this.form.get('price')!; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading   = true;
    this.errorMsg  = '';
    this.successMsg = '';

    const data = this.form.value as any;

    if (this.isEdit) {
      this.courseService.updateCourse(this.courseId, data).subscribe({
        next: () => {
          this.loading    = false;
          this.successMsg = 'Course updated successfully!';
          setTimeout(() => this.router.navigate(['/courses', this.courseId]), 1200);
        },
        error: (err) => {
          this.loading  = false;
          this.errorMsg = err.error?.message || 'Update failed.';
        }
      });
    } else {
      this.courseService.createCourse(data).subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate(['/courses', res.course._id]);
        },
        error: (err) => {
          this.loading  = false;
          this.errorMsg = err.error?.message || 'Failed to create course.';
          // Show individual validation errors if present
          if (err.error?.errors) {
            this.errorMsg = err.error.errors.map((e: any) => e.msg).join(', ');
          }
        }
      });
    }
  }
}
