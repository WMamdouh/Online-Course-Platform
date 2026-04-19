import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LessonService } from '../../../core/services/lesson.service';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './lesson-form.component.html',
  styleUrl: './lesson-form.component.css'
})
export class LessonFormComponent implements OnInit {
  form = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    content:     ['', [Validators.required, Validators.minLength(10)]],
    order:       [1,  [Validators.required, Validators.min(1)]],
    videoUrl:    [''],
    duration:    [0,  [Validators.min(0)]],
    isPublished: [false]
  });

  courseId = '';
  lessonId = '';
  isEdit   = false;
  loading  = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId')!;
    this.lessonId = this.route.snapshot.paramMap.get('lessonId') || '';
    this.isEdit   = !!this.lessonId;

    if (this.isEdit) {
      this.lessonService.getLessonById(this.courseId, this.lessonId).subscribe({
        next: res => {
          this.form.patchValue({
            title:       res.lesson.title,
            content:     res.lesson.content,
            order:       res.lesson.order,
            videoUrl:    res.lesson.videoUrl || '',
            duration:    res.lesson.duration,
            isPublished: res.lesson.isPublished
          });
        },
        error: () => { this.errorMsg = 'Failed to load lesson.'; }
      });
    }
  }

  get title()   { return this.form.get('title')!; }
  get content() { return this.form.get('content')!; }
  get order()   { return this.form.get('order')!; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading  = true;
    this.errorMsg = '';

    const data = this.form.value as any;

    if (this.isEdit) {
      this.lessonService.updateLesson(this.courseId, this.lessonId, data).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/courses', this.courseId, 'lessons', this.lessonId]);
        },
        error: (err) => {
          this.loading  = false;
          this.errorMsg = err.error?.message || 'Update failed.';
        }
      });
    } else {
      this.lessonService.createLesson(this.courseId, data).subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate(['/courses', this.courseId, 'lessons', res.lesson._id]);
        },
        error: (err) => {
          this.loading  = false;
          this.errorMsg = err.error?.message || 'Failed to create lesson.';
          if (err.error?.errors) {
            this.errorMsg = err.error.errors.map((e: any) => e.msg).join(', ');
          }
        }
      });
    }
  }
}
