import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lesson, LessonsResponse, Comment, CommentsResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private base = (courseId: string) =>
    `${environment.apiUrl}/courses/${courseId}/lessons`;

  constructor(private http: HttpClient) {}

  // ── Lessons CRUD ──────────────────────────────────────────────────────────

  getLessons(courseId: string, page = 1): Observable<LessonsResponse> {
    const p = new HttpParams().set('page', page);
    return this.http.get<LessonsResponse>(this.base(courseId), { params: p });
  }

  getLessonById(courseId: string, lessonId: string): Observable<{ lesson: Lesson }> {
    return this.http.get<{ lesson: Lesson }>(`${this.base(courseId)}/${lessonId}`);
  }

  createLesson(courseId: string, data: {
    title: string; content: string; order: number;
    videoUrl?: string; duration?: number; isPublished?: boolean;
  }): Observable<{ message: string; lesson: Lesson }> {
    return this.http.post<{ message: string; lesson: Lesson }>(this.base(courseId), data);
  }

  updateLesson(courseId: string, lessonId: string, data: Partial<Lesson>):
    Observable<{ message: string; lesson: Lesson }> {
    return this.http.patch<{ message: string; lesson: Lesson }>(
      `${this.base(courseId)}/${lessonId}`, data
    );
  }

  deleteLesson(courseId: string, lessonId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base(courseId)}/${lessonId}`);
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  markComplete(courseId: string, lessonId: string): Observable<{
    message: string; progressPercent: number; completedAt: string | null;
  }> {
    return this.http.post<any>(`${this.base(courseId)}/${lessonId}/complete`, {});
  }

  // ── Comments ──────────────────────────────────────────────────────────────

  getComments(courseId: string, lessonId: string, page = 1): Observable<CommentsResponse> {
    const p = new HttpParams().set('page', page);
    return this.http.get<CommentsResponse>(
      `${this.base(courseId)}/${lessonId}/comments`, { params: p }
    );
  }

  addComment(courseId: string, lessonId: string, content: string):
    Observable<{ message: string; comment: Comment }> {
    return this.http.post<{ message: string; comment: Comment }>(
      `${this.base(courseId)}/${lessonId}/comments`, { content }
    );
  }

  updateComment(courseId: string, lessonId: string, commentId: string, content: string):
    Observable<{ message: string; comment: Comment }> {
    return this.http.patch<{ message: string; comment: Comment }>(
      `${this.base(courseId)}/${lessonId}/comments/${commentId}`, { content }
    );
  }

  deleteComment(courseId: string, lessonId: string, commentId: string):
    Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.base(courseId)}/${lessonId}/comments/${commentId}`
    );
  }
}
