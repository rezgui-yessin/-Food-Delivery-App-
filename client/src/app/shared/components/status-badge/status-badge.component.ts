import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatus } from '../../../core/models';
import { formatStatus, statusBadgeClass } from '../../../core/utils/order-helpers';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wide" [class]="statusBadgeClass(status)">
      {{ formatStatus(status) }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: OrderStatus;
  readonly formatStatus = formatStatus;
  readonly statusBadgeClass = statusBadgeClass;
}
