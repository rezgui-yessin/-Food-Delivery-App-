import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from './core/services/auth.service';
import { Role } from './core/models';
import { ConnectivityService } from './core/services/connectivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  readonly connectivity = inject(ConnectivityService);
  title = 'FoodRush';

  /** Only CUSTOMER and ADMIN roles have a cart */
  readonly showCart = computed(() => {
    const role = this.authService.userRole();
    return role === Role.CUSTOMER || role === Role.ADMIN || role === null;
  });
}
