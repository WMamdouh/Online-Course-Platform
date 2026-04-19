import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stars">
      <span *ngFor="let star of [1,2,3,4,5]"
            class="star"
            [class.filled]="star <= (hovered || value)"
            [class.clickable]="interactive"
            (mouseenter)="interactive && (hovered = star)"
            (mouseleave)="interactive && (hovered = 0)"
            (click)="interactive && select(star)">
        ★
      </span>
      <span *ngIf="showValue" class="star-value">{{ value | number:'1.1-1' }}</span>
    </div>
  `,
  styles: [`
    .stars { display: inline-flex; align-items: center; gap: 2px; }
    .star { font-size: 18px; color: var(--text-muted); transition: color 0.15s; line-height: 1; }
    .star.filled { color: var(--accent); }
    .star.clickable { cursor: pointer; font-size: 22px; }
    .star.clickable:hover { transform: scale(1.2); }
    .star-value { margin-left: 6px; font-size: 13px; color: var(--text-secondary); font-weight: 600; }
  `]
})
export class StarRatingComponent {
  @Input() value: number = 0;
  @Input() interactive: boolean = false;
  @Input() showValue: boolean = false;
  @Output() rated = new EventEmitter<number>();

  hovered = 0;

  select(star: number) {
    this.value = star;
    this.rated.emit(star);
  }
}
