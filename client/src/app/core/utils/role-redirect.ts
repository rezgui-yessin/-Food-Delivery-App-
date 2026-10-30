import { Role } from '../models';

export function getDashboardRoute(role: Role | null | undefined): string {
  switch (role) {
    case Role.RESTAURANT_OWNER: return '/restaurant';
    case Role.DELIVERY_DRIVER:  return '/driver';
    case Role.ADMIN:            return '/admin';
    default:                    return '/customer';
  }
}

export function isDashboardUrl(url: string): boolean {
  return url.startsWith('/customer')
    || url.startsWith('/restaurant')
    || url.startsWith('/driver')
    || url.startsWith('/admin')
    || url.startsWith('/customer-dashboard')
    || url.startsWith('/restaurant-dashboard')
    || url.startsWith('/driver-portal');
}
