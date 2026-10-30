import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryRequest, Restaurant, RestaurantAnalytics, RestaurantRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/restaurants`;

  getAll(cuisine?: string): Observable<Restaurant[]> {
    let params = new HttpParams();
    if (cuisine && cuisine.trim() && cuisine.toLowerCase() !== 'all') {
      params = params.set('cuisine', cuisine.trim());
    }
    return this.http.get<Restaurant[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/${id}`);
  }

  create(restaurant: RestaurantRequest): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.baseUrl, restaurant);
  }

  update(id: string, restaurant: RestaurantRequest): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/${id}`, restaurant);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadImage(id: string, file: File): Observable<Restaurant> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Restaurant>(`${this.baseUrl}/${id}/image`, formData);
  }

  updateHours(id: string, hours: Record<string, string>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/${id}/hours`, hours);
  }

  getCategories(id: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/${id}/categories`);
  }

  createCategory(id: string, category: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/${id}/categories`, category);
  }

  updateCategory(restaurantId: string, categoryId: string, category: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${restaurantId}/categories/${categoryId}`, category);
  }

  deleteCategory(restaurantId: string, categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${restaurantId}/categories/${categoryId}`);
  }

  getAnalytics(id: string): Observable<RestaurantAnalytics> {
    return this.http.get<RestaurantAnalytics>(`${this.baseUrl}/${id}/analytics`);
  }
}
