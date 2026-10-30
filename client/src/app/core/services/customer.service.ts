import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address, AddressRequest, Notification, Restaurant, Review, User } from '../models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users/me`;
  private readonly restaurantsUrl = `${environment.apiUrl}/restaurants`;

  updateProfile(profile: { fullName: string; phone: string }): Observable<User> {
    return this.http.put<User>(this.usersUrl, profile);
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.usersUrl}/addresses`);
  }

  addAddress(address: AddressRequest): Observable<Address> {
    return this.http.post<Address>(`${this.usersUrl}/addresses`, address);
  }

  updateAddress(id: string, address: AddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.usersUrl}/addresses/${id}`, address);
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/addresses/${id}`);
  }

  getFavorites(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.usersUrl}/favorites`);
  }

  toggleFavorite(restaurantId: string): Observable<{ favorite: boolean }> {
    return this.http.post<{ favorite: boolean }>(`${this.usersUrl}/favorites/${restaurantId}`, {});
  }

  getReviews(restaurantId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.restaurantsUrl}/${restaurantId}/reviews`);
  }

  saveReview(restaurantId: string, review: { rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(`${this.restaurantsUrl}/${restaurantId}/reviews`, review);
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.usersUrl}/notifications`);
  }

  markNotificationRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.usersUrl}/notifications/${id}/read`, {});
  }
}
