import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination" *ngIf="pages > 1">
      <button class="page-btn" [disabled]="current <= 1" (click)="go(current - 1)">‹</button>

      <ng-container *ngFor="let p of pageList()">
        <span *ngIf="p === -1" class="page-ellipsis">…</span>
        <button *ngIf="p !== -1"
                class="page-btn"
                [class.active]="p === current"
                (click)="go(p)">
          {{ p }}
        </button>
      </ng-container>

      <button class="page-btn" [disabled]="current >= pages" (click)="go(current + 1)">›</button>
    </div>
  `,
  styles: [`
    .pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 40px; }
    .page-btn {
      min-width: 38px; height: 38px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-secondary);
      font-family: var(--font-body); font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all var(--transition);
      display: flex; align-items: center; justify-content: center;
    }
    .page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
    .page-btn.active { background: var(--accent); color: #0d0f14; border-color: var(--accent); font-weight: 700; }
    .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .page-ellipsis { color: var(--text-muted); padding: 0 4px; }
  `]
})
export class PaginationComponent {
  @Input() current: number = 1;
  @Input() pages: number   = 1;
  @Output() pageChange = new EventEmitter<number>();

  go(p: number) {
    if (p >= 1 && p <= this.pages) this.pageChange.emit(p);
  }

  pageList(): number[] {
    if (this.pages <= 7) return Array.from({ length: this.pages }, (_, i) => i + 1);
    const list: number[] = [1];
    if (this.current > 3) list.push(-1);
    for (let i = Math.max(2, this.current - 1); i <= Math.min(this.pages - 1, this.current + 1); i++) list.push(i);
    if (this.current < this.pages - 2) list.push(-1);
    list.push(this.pages);
    return list;
  }
}
