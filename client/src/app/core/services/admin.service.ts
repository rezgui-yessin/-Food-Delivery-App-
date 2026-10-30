import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { OrderService } from './order.service';
import { RestaurantService } from './restaurant.service';
import { CouponService } from './coupon.service';
import { AdminReport, AdminUser, AdminUserCreateRequest, AuditLog, Coupon, Order, PlatformSettings, PlatformStats, Restaurant, Role } from '../models';
import { derivePlatformStats } from '../utils/order-helpers';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly orderService = inject(OrderService);
  private readonly restaurantService = inject(RestaurantService);
  private readonly couponService = inject(CouponService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  getDashboardData(): Observable<{
    restaurants: Restaurant[];
    orders: Order[];
    coupons: Coupon[];
    stats: PlatformStats;
  }> {
    return forkJoin({
      restaurants: this.restaurantService.getAll(),
      orders: this.orderService.getAll(),
      coupons: this.couponService.getAll()
    }).pipe(
      map(({ restaurants, orders, coupons }) => ({
        restaurants,
        orders,
        coupons,
        stats: derivePlatformStats(orders, restaurants)
      }))
    );
  }

  getUsers(query?: string, role?: Role): Observable<AdminUser[]> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    if (role) params = params.set('role', role);
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`, { params });
  }

  createUser(user: AdminUserCreateRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}/users`, user);
  }

  updateUser(id: string, update: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.baseUrl}/users/${id}`, update);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  getManagedRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants`);
  }

  approveRestaurant(id: string, approved: boolean): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.baseUrl}/restaurants/${id}/approval`, {}, { params: { approved } });
  }

  getAuditLogs(): Observable<AuditLog[]> { return this.http.get<AuditLog[]>(`${this.baseUrl}/audit-logs`); }
  getSettings(): Observable<PlatformSettings> { return this.http.get<PlatformSettings>(`${this.baseUrl}/settings`); }
  updateSettings(settings: PlatformSettings): Observable<PlatformSettings> {
    return this.http.put<PlatformSettings>(`${this.baseUrl}/settings`, settings);
  }
  getReport(): Observable<AdminReport> { return this.http.get<AdminReport>(`${this.baseUrl}/reports`); }
  refundOrder(id: string): Observable<Order> { return this.http.post<Order>(`${this.baseUrl}/orders/${id}/refund`, {}); }
}
