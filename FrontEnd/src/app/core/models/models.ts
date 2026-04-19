// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  bio?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: User;
}

export interface UsersResponse {
  total: number;
  page: number;
  pages: number;
  users: User[];
}

// ─── Course ───────────────────────────────────────────────────────────────────
export interface Rating {
  _id: string;
  user: User | string;
  value: number;
  review?: string;
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: User | string;
  category: string;
  price: number;
  thumbnail?: string;
  isPublished: boolean;
  ratings: Rating[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  total: number;
  page: number;
  pages: number;
  courses: Course[];
}

export interface CourseDetailResponse {
  course: Course;
  lessons: LessonSummary[];
}

// ─── Lesson ───────────────────────────────────────────────────────────────────
export interface Comment {
  _id: string;
  content: string;
  user: User | string;
  createdAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  course: string;
  isPublished: boolean;
  comments: Comment[];
  createdAt: string;
}

export interface LessonSummary {
  _id: string;
  title: string;
  order: number;
  duration: number;
  isPublished: boolean;
}

export interface LessonsResponse {
  total: number;
  page: number;
  pages: number;
  lessons: LessonSummary[];
}

export interface CommentsResponse {
  total: number;
  page: number;
  pages: number;
  comments: Comment[];
}

// ─── Enrollment ───────────────────────────────────────────────────────────────
export interface Enrollment {
  _id: string;
  student: User | string;
  course: Course | string;
  completedLessons: string[];
  progressPercent: number;
  completedAt?: string;
  createdAt: string;
}

export interface EnrollmentsResponse {
  total: number;
  page: number;
  pages: number;
  enrollments: Enrollment[];
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiError {
  status: string;
  message: string;
  errors?: { msg: string; path: string }[];
}
