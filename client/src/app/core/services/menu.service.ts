import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuItem, MenuItemRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getByRestaurant(restaurantId: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/restaurants/${restaurantId}/menu-items`);
  }

  getById(restaurantId: string, id: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.baseUrl}/restaurants/${restaurantId}/menu-items/${id}`);
  }

  create(restaurantId: string, item: MenuItemRequest): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.baseUrl}/restaurants/${restaurantId}/menu-items`, item);
  }

  update(restaurantId: string, id: string, item: MenuItemRequest): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.baseUrl}/restaurants/${restaurantId}/menu-items/${id}`, item);
  }

  delete(restaurantId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/restaurants/${restaurantId}/menu-items/${id}`);
  }

  uploadImage(restaurantId: string, id: string, file: File): Observable<MenuItem> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<MenuItem>(`${this.baseUrl}/restaurants/${restaurantId}/menu-items/${id}/image`, formData);
  }

  deleteImage(restaurantId: string, id: string): Observable<MenuItem> {
    return this.http.delete<MenuItem>(`${this.baseUrl}/restaurants/${restaurantId}/menu-items/${id}/image`);
  }

  toggleAvailability(restaurantId: string, id: string, available: boolean): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.baseUrl}/restaurants/${restaurantId}/menu-items/${id}/availability`, {}, {
      params: { available }
    });
  }
}
