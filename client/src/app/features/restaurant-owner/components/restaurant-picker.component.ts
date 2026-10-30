import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerContextService } from '../../../core/services/owner-context.service';

@Component({
  selector: 'app-restaurant-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (ctx.restaurants().length > 1) {
      <select
        class="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        [ngModel]="ctx.selectedId()"
        (ngModelChange)="ctx.select($event)">
        @for (res of ctx.restaurants(); track res.id) {
          <option [value]="res.id">{{ res.name }}</option>
        }
      </select>
    } @else if (ctx.selected(); as restaurant) {
      <p class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ restaurant.name }}</p>
    }
  `
})
export class RestaurantPickerComponent implements OnInit {
  readonly ctx = inject(OwnerContextService);

  ngOnInit(): void {
    if (!this.ctx.restaurants().length) {
      this.ctx.load();
    }
  }
}
