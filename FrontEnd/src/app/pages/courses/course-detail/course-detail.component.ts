import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { EnrollmentsResponse, LessonSummary, Course, Enrollment, User } from '../../../core/models/models';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StarRatingComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit {
  course:   Course | null = null;
  lessons:  LessonSummary[] = [];
  loading  = true;
  errorMsg = '';

  // Enrollment state
  isEnrolled    = false;
  enrollLoading = false;
  enrollMsg     = '';

  // Rating state
  showRatingForm = false;
  ratingValue    = 0;
  ratingReview   = '';
  ratingLoading  = false;
  ratingMsg      = '';
  userRating     = 0; // current user's existing rating

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public  auth: AuthService,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: string) {
    this.loading = true;
    this.courseService.getCourseById(id).subscribe({
      next: res => {
        this.course  = res.course;
        this.lessons = res.lessons;
        this.loading = false;
        this.checkEnrollment();
        this.checkUserRating();
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Course not found.';
      }
    });
  }

  // Check if current user is enrolled
  private checkEnrollment() {
    if (!this.auth.isLoggedIn() || !this.auth.isStudent()) return;
    const userId = this.auth.currentUser()?._id;
    if (!userId || !this.course) return;

    this.courseService.getCourseStudents(this.course._id).subscribe({
      next: (res: EnrollmentsResponse) => {
        this.isEnrolled = res.enrollments.some(e => {
          const student = e.student as User;
          return student._id === userId;
        });
      }
    });
  }

  // Check if user already rated
  private checkUserRating() {
    if (!this.auth.isLoggedIn() || !this.course) return;
    const userId = this.auth.currentUser()?._id;
    const existing = this.course.ratings?.find(r => {
      const u = r.user as User;
      return u._id === userId;
    });
    if (existing) {
      this.userRating   = existing.value;
      this.ratingValue  = existing.value;
      this.ratingReview = existing.review || '';
    }
  }

  // Enroll
  enroll() {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.enrollLoading = true;
    this.enrollMsg     = '';
    this.courseService.enrollInCourse(this.course!._id).subscribe({
      next: () => {
        this.isEnrolled    = true;
        this.enrollLoading = false;
        this.enrollMsg     = 'Successfully enrolled!';
      },
      error: (err) => {
        this.enrollLoading = false;
        this.enrollMsg     = err.error?.message || 'Enrollment failed.';
      }
    });
  }

  // Unenroll
  unenroll() {
    if (!confirm('Are you sure you want to unenroll from this course?')) return;
    this.enrollLoading = true;
    this.courseService.unenrollFromCourse(this.course!._id).subscribe({
      next: () => {
        this.isEnrolled    = false;
        this.enrollLoading = false;
        this.enrollMsg     = 'Unenrolled successfully.';
      },
      error: () => { this.enrollLoading = false; }
    });
  }

  // Submit rating
  submitRating() {
    if (this.ratingValue === 0) return;
    this.ratingLoading = true;
    this.courseService.rateCourse(this.course!._id, this.ratingValue, this.ratingReview).subscribe({
      next: (res: any) => {
        this.ratingLoading       = false;
        this.ratingMsg           = 'Rating submitted!';
        this.showRatingForm      = false;
        this.userRating          = this.ratingValue;
        if (this.course) this.course.averageRating = res.averageRating;
      },
      error: (err) => {
        this.ratingLoading = false;
        this.ratingMsg     = err.error?.message || 'Failed to submit rating.';
      }
    });
  }

  onRated(value: number) { this.ratingValue = value; }

  getInstructorName(): string {
    const inst = this.course?.instructor;
    return typeof inst === 'object' ? inst.name : 'Instructor';
  }

  getInstructorBio(): string {
    const inst = this.course?.instructor;
    return typeof inst === 'object' ? (inst.bio || '') : '';
  }

  isOwner(): boolean {
    const inst = this.course?.instructor;
    const id   = typeof inst === 'object' ? inst._id : inst;
    return id === this.auth.currentUser()?._id;
  }

  totalDuration(): number {
    return this.lessons.reduce((s, l) => s + (l.duration || 0), 0);
  }
}
