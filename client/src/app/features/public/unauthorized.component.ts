import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { getDashboardRoute } from '../../core/utils/role-redirect';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p class="text-sm font-semibold text-primary">403</p>
      <h1 class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Access denied</h1>
      <p class="mt-2 text-slate-500 max-w-md">Your account does not have permission to view this area.</p>
      <a [routerLink]="home()" class="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold">Go to my dashboard</a>
    </div>
  `
})
export class UnauthorizedComponent {
  private readonly auth = inject(AuthService);
  home(): string {
    return getDashboardRoute(this.auth.userRole());
  }
}
