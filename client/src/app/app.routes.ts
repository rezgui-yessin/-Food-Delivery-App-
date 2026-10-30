import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
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
    path: 'orders/:id/tracking',
    loadComponent: () => import('./features/customer/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/public/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'customer',
    loadComponent: () => import('./shared/components/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard, roleGuard([Role.CUSTOMER, Role.ADMIN])],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/customer/customer-dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/customer/customer-orders/customer-orders.component').then(m => m.CustomerOrdersComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/customer/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
      }
    ]
  },
  {
    path: 'restaurant',
    loadComponent: () => import('./features/restaurant-owner/restaurant-dashboard.component').then(m => m.RestaurantDashboardComponent),
    canActivate: [authGuard, roleGuard([Role.RESTAURANT_OWNER, Role.ADMIN])]
  },
  {
    path: 'restaurant/:tab',
    loadComponent: () => import('./features/restaurant-owner/restaurant-dashboard.component').then(m => m.RestaurantDashboardComponent),
    canActivate: [authGuard, roleGuard([Role.RESTAURANT_OWNER, Role.ADMIN])]
  },
  {
    path: 'driver',
    loadComponent: () => import('./features/driver/driver-portal.component').then(m => m.DriverPortalComponent),
    canActivate: [authGuard, roleGuard([Role.DELIVERY_DRIVER, Role.ADMIN])]
  },
  {
    path: 'driver/:tab',
    loadComponent: () => import('./features/driver/driver-portal.component').then(m => m.DriverPortalComponent),
    canActivate: [authGuard, roleGuard([Role.DELIVERY_DRIVER, Role.ADMIN])]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard([Role.ADMIN])]
  },
  {
    path: 'admin/:section',
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard([Role.ADMIN])]
  },
  { path: 'orders', redirectTo: '/customer/orders', pathMatch: 'full' },
  { path: 'customer-dashboard', redirectTo: '/customer', pathMatch: 'full' },
  { path: 'customer-dashboard/orders', redirectTo: '/customer/orders', pathMatch: 'full' },
  { path: 'customer-dashboard/profile', redirectTo: '/customer/profile', pathMatch: 'full' },
  { path: 'customer-dashboard/addresses', redirectTo: '/customer/profile', pathMatch: 'full' },
  { path: 'customer-dashboard/favorites', redirectTo: '/customer', pathMatch: 'full' },
  { path: 'restaurant-dashboard', redirectTo: '/restaurant', pathMatch: 'full' },
  { path: 'restaurant-dashboard/orders', redirectTo: '/restaurant/orders', pathMatch: 'full' },
  { path: 'restaurant-dashboard/menu', redirectTo: '/restaurant/menu', pathMatch: 'full' },
  { path: 'restaurant-dashboard/analytics', redirectTo: '/restaurant/analytics', pathMatch: 'full' },
  { path: 'restaurant-dashboard/profile', redirectTo: '/restaurant/settings', pathMatch: 'full' },
  { path: 'driver-portal', redirectTo: '/driver', pathMatch: 'full' },
  { path: 'driver-portal/available', redirectTo: '/driver/available', pathMatch: 'full' },
  { path: 'driver-portal/active', redirectTo: '/driver/active', pathMatch: 'full' },
  { path: 'driver-portal/history', redirectTo: '/driver/history', pathMatch: 'full' },
  { path: 'driver-portal/earnings', redirectTo: '/driver/earnings', pathMatch: 'full' },
  { path: 'admin/drivers', redirectTo: '/admin', pathMatch: 'full' },
  { path: 'admin/customers', redirectTo: '/admin', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found.component').then(m => m.NotFoundComponent)
  }
];
