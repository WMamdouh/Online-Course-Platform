import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Course, CoursesResponse, CourseDetailResponse,
  Enrollment, EnrollmentsResponse
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  // ── Public ────────────────────────────────────────────────────────────────

  getCourses(params: {
    page?: number; limit?: number;
    search?: string; category?: string;
  } = {}): Observable<CoursesResponse> {
    let p = new HttpParams();
    if (params.page)     p = p.set('page',     params.page);
    if (params.limit)    p = p.set('limit',    params.limit);
    if (params.search)   p = p.set('search',   params.search);
    if (params.category) p = p.set('category', params.category);
    return this.http.get<CoursesResponse>(this.apiUrl, { params: p });
  }

  getCourseById(id: string): Observable<CourseDetailResponse> {
    return this.http.get<CourseDetailResponse>(`${this.apiUrl}/${id}`);
  }

  // ── Instructor ────────────────────────────────────────────────────────────

  getMyCourses(params: { page?: number; limit?: number } = {}): Observable<CoursesResponse> {
    let p = new HttpParams();
    if (params.page)  p = p.set('page',  params.page);
    if (params.limit) p = p.set('limit', params.limit);
    return this.http.get<CoursesResponse>(`${this.apiUrl}/my`, { params: p });
  }

  createCourse(data: {
    title: string; description: string;
    category: string; price?: number; isPublished?: boolean;
  }): Observable<{ message: string; course: Course }> {
    return this.http.post<{ message: string; course: Course }>(this.apiUrl, data);
  }

  updateCourse(id: string, data: Partial<Course>): Observable<{ message: string; course: Course }> {
    return this.http.patch<{ message: string; course: Course }>(`${this.apiUrl}/${id}`, data);
  }

  deleteCourse(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getCourseStudents(id: string, page = 1): Observable<EnrollmentsResponse> {
    const p = new HttpParams().set('page', page);
    return this.http.get<EnrollmentsResponse>(`${this.apiUrl}/${id}/students`, { params: p });
  }

  // ── Enrollment ────────────────────────────────────────────────────────────

  enrollInCourse(id: string): Observable<{ message: string; enrollment: Enrollment }> {
    return this.http.post<{ message: string; enrollment: Enrollment }>(
      `${this.apiUrl}/${id}/enroll`, {}
    );
  }

  unenrollFromCourse(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}/enroll`);
  }

  // ── Ratings ───────────────────────────────────────────────────────────────

  rateCourse(id: string, value: number, review?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/ratings`, { value, review });
  }

  deleteRating(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}/ratings`);
  }
}
