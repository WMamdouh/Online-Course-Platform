import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UsersResponse, EnrollmentsResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(page = 1, limit = 10): Observable<UsersResponse> {
    const p = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<UsersResponse>(this.apiUrl, { params: p });
  }

  getUserById(id: string): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/${id}`);
  }

  createUser(data: {
    name: string; email: string; password: string;
    role: string; bio?: string;
  }): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(this.apiUrl, data);
  }

  updateUser(id: string, data: Partial<User>): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getUserEnrollments(id: string, page = 1): Observable<EnrollmentsResponse> {
    const p = new HttpParams().set('page', page);
    return this.http.get<EnrollmentsResponse>(
      `${this.apiUrl}/${id}/enrollments`, { params: p }
    );
  }
}
