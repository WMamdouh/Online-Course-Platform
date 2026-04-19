import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LessonService } from '../../../core/services/lesson.service';
import { AuthService } from '../../../core/services/auth.service';
import { Lesson, Comment } from '../../../core/models/models';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lesson-detail.component.html',
  styleUrl: './lesson-detail.component.css'
})
export class LessonDetailComponent implements OnInit {
  lesson:   Lesson | null = null;
  comments: Comment[] = [];
  courseId  = '';
  lessonId  = '';
  loading   = true;
  errorMsg  = '';

  // Progress
  completed     = false;
  progressMsg   = '';
  progressPercent = 0;

  // Comments
  newComment    = '';
  commentLoading = false;
  editingId     = '';
  editContent   = '';
  commentMsg    = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public  auth: AuthService,
    private lessonService: LessonService
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId')!;
    this.lessonId = this.route.snapshot.paramMap.get('lessonId')!;
    this.loadLesson();
  }

  loadLesson() {
    this.loading = true;
    this.lessonService.getLessonById(this.courseId, this.lessonId).subscribe({
      next: res => {
        this.lesson   = res.lesson;
        this.comments = res.lesson.comments || [];
        this.loading  = false;
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Lesson not found or access denied.';
      }
    });
  }

  // Mark lesson as complete
  markComplete() {
    this.lessonService.markComplete(this.courseId, this.lessonId).subscribe({
      next: res => {
        this.completed      = true;
        this.progressPercent = res.progressPercent;
        this.progressMsg    = `Lesson marked complete! Course progress: ${res.progressPercent}%`;
      },
      error: err => {
        this.progressMsg = err.error?.message || 'Could not mark as complete.';
      }
    });
  }

  // Add comment
  addComment() {
    if (!this.newComment.trim()) return;
    this.commentLoading = true;
    this.commentMsg     = '';
    this.lessonService.addComment(this.courseId, this.lessonId, this.newComment).subscribe({
      next: res => {
        this.comments.push(res.comment);
        this.newComment     = '';
        this.commentLoading = false;
      },
      error: err => {
        this.commentLoading = false;
        this.commentMsg     = err.error?.message || 'Failed to add comment.';
      }
    });
  }

  // Start editing
  startEdit(c: Comment) {
    this.editingId  = c._id;
    this.editContent = c.content;
  }

  // Save edited comment
  saveEdit(c: Comment) {
    if (!this.editContent.trim()) return;
    this.lessonService.updateComment(this.courseId, this.lessonId, c._id, this.editContent).subscribe({
      next: res => {
        const idx = this.comments.findIndex(x => x._id === c._id);
        if (idx !== -1) this.comments[idx].content = res.comment.content;
        this.editingId = '';
      },
      error: err => { this.commentMsg = err.error?.message || 'Update failed.'; }
    });
  }

  cancelEdit() { this.editingId = ''; }

  // Delete comment
  deleteComment(c: Comment) {
    if (!confirm('Delete this comment?')) return;
    this.lessonService.deleteComment(this.courseId, this.lessonId, c._id).subscribe({
      next: () => {
        this.comments = this.comments.filter(x => x._id !== c._id);
      },
      error: err => { this.commentMsg = err.error?.message || 'Delete failed.'; }
    });
  }

  canEditComment(c: Comment): boolean {
    const uid = this.auth.currentUser()?._id;
    const cUser = c.user as any;
    return cUser._id === uid || this.auth.isAdmin();
  }

  getUsername(c: Comment): string {
    const u = c.user as any;
    return u?.name || 'Student';
  }

  getUserInitial(c: Comment): string {
    return this.getUsername(c).charAt(0).toUpperCase();
  }
}
