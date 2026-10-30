import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <nav class="flex items-center justify-between gap-3 text-sm" aria-label="Pagination">
      <span class="text-slate-500">Page {{ page }} of {{ totalPages }}</span>
      <div class="flex gap-2">
        <button (click)="pageChange.emit(page - 1)" [disabled]="page <= 1" class="px-3 py-1.5 rounded-lg border disabled:opacity-40">Previous</button>
        <button (click)="pageChange.emit(page + 1)" [disabled]="page >= totalPages" class="px-3 py-1.5 rounded-lg border disabled:opacity-40">Next</button>
      </div>
    </nav>
  `
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();
}
