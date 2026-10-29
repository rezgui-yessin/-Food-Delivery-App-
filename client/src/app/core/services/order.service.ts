import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderCreateRequest, OrderStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  create(order: OrderCreateRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  getAll(restaurantId?: string, status?: OrderStatus): Observable<Order[]> {
    let params = new HttpParams();
    if (restaurantId) params = params.set('restaurantId', restaurantId);
    if (status) params = params.set('status', status);
    return this.http.get<Order[]>(this.baseUrl, { params });
  }

  getByRestaurant(restaurantId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/restaurant/${restaurantId}`);
  }

  getAvailableForPickup(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/available-for-pickup`);
  }

  getMyDeliveries(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/my-deliveries`);
  }

  acceptOrder(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/${id}/accept`, {});
  }

  updateStatus(id: string, status: OrderStatus, note?: string): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/status`, { status, note });
  }
}

