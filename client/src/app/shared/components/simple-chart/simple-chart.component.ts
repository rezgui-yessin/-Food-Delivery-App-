import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-64 flex flex-col justify-end pt-6 pb-2">
      @if (chartData().length === 0) {
        <div class="h-full flex items-center justify-center text-xs text-slate-400">
          No data available for chart
        </div>
      } @else {
        <!-- Bars Grid -->
        <div class="flex-1 flex items-end gap-3 sm:gap-6 px-2 border-b border-slate-200 dark:border-slate-800">
          @for (item of chartData(); track item.label) {
            <div class="flex-1 flex flex-col items-center h-full justify-end group relative">
              <!-- Value tooltip badge on hover -->
              <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-bold pointer-events-none whitespace-nowrap z-10 shadow">
                {{ label }}: {{ item.value }}
              </div>

              <!-- Bar element -->
              <div
                class="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-primary to-orange-400 hover:brightness-110 transition-all duration-500 shadow-sm"
                [style.height.%]="item.heightPercent">
              </div>
            </div>
          }
        </div>

        <!-- Labels Row -->
        <div class="flex items-center gap-3 sm:gap-6 px-2 mt-2">
          @for (item of chartData(); track item.label) {
            <div class="flex-1 text-center truncate">
              <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate" [title]="item.label">
                {{ item.label }}
              </span>
              <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {{ item.value }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SimpleChartComponent {
  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() label = 'Revenue';

  readonly chartData = computed(() => {
    const labels = this.labels || [];
    const values = this.values || [];
    const max = Math.max(...values, 1);

    return labels.map((label, index) => {
      const val = values[index] ?? 0;
      const heightPercent = Math.max(8, Math.round((val / max) * 100));
      return { label, value: val, heightPercent };
    });
  });
}
