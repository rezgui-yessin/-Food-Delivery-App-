import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, Restaurant, User } from '../models';

export interface PlatformStats {
  totalOrders: number;
  totalRevenue: number;
  activeRestaurants: number;
  registeredDrivers: number;
  activeOrders: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.baseUrl}/admin/stats`);
  }

  getAllRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.baseUrl}/restaurants`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  toggleRestaurantStatus(id: string, open: boolean): Observable<Restaurant> {
    return this.http.patch<Restaurant>(`${this.baseUrl}/restaurants/${id}`, { open });
  }
}
