import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DriverEarnings, DriverProfile, Order } from '../models';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/drivers`;

  getProfile(): Observable<DriverProfile> { return this.http.get<DriverProfile>(`${this.baseUrl}/me`); }
  updateProfile(profile: Partial<DriverProfile>): Observable<DriverProfile> {
    return this.http.put<DriverProfile>(`${this.baseUrl}/me`, profile);
  }
  setAvailability(available: boolean): Observable<DriverProfile> {
    return this.http.patch<DriverProfile>(`${this.baseUrl}/me/availability`, {}, { params: { available } });
  }
  updateLocation(latitude: number, longitude: number): Observable<DriverProfile> {
    return this.http.patch<DriverProfile>(`${this.baseUrl}/me/location`, { latitude, longitude });
  }
  getEarnings(): Observable<DriverEarnings> { return this.http.get<DriverEarnings>(`${this.baseUrl}/me/earnings`); }
  submitProof(orderId: string, proof: { signature?: string; photoUrl?: string; verificationCode?: string }): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/deliveries/${orderId}/proof`, proof);
  }
}
