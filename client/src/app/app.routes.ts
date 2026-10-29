import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/customer/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'restaurants/:id',
    loadComponent: () => import('./features/customer/restaurant-detail/restaurant-detail.component').then(m => m.RestaurantDetailComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/customer/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/customer/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id/tracking',
    loadComponent: () => import('./features/customer/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'restaurant-dashboard',
    loadComponent: () => import('./features/restaurant-owner/restaurant-dashboard.component').then(m => m.RestaurantDashboardComponent),
    canActivate: [authGuard, roleGuard([Role.RESTAURANT_OWNER, Role.ADMIN])]
  },
  {
    path: 'driver-portal',
    loadComponent: () => import('./features/driver/driver-portal.component').then(m => m.DriverPortalComponent),
    canActivate: [authGuard, roleGuard([Role.DELIVERY_DRIVER, Role.ADMIN])]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard([Role.ADMIN])]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
