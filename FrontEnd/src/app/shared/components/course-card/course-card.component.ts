import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Course } from '../../../core/models/models';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.css'
})
export class CourseCardComponent {
  @Input() course!: Course;

  getInstructorName(): string {
    const inst = this.course.instructor;
    return typeof inst === 'object' ? inst.name : 'Instructor';
  }
}
