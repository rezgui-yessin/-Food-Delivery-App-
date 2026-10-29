import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Restaurant, RestaurantRequest } from '../models';

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
}

