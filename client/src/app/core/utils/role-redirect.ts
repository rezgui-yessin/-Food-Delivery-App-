import { Role } from '../models';

/** Returns the dashboard route for a given role after login / register */
export function getDashboardRoute(role: Role | null | undefined): string {
  switch (role) {
    case Role.RESTAURANT_OWNER: return '/restaurant-dashboard';
    case Role.DELIVERY_DRIVER:  return '/driver-portal';
    case Role.ADMIN:            return '/admin';
    default:                    return '/customer-dashboard';
  }
}
