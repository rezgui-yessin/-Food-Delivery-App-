import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coupon, CouponRequest, CouponValidationResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/coupons`;

  validate(code: string, restaurantId: string, amount: number): Observable<CouponValidationResponse> {
    const params = new HttpParams()
      .set('code', code.trim().toUpperCase())
      .set('restaurantId', restaurantId)
      .set('amount', amount.toString());
    return this.http.get<CouponValidationResponse>(`${this.baseUrl}/validate`, { params });
  }

  getAll(restaurantId?: string): Observable<Coupon[]> {
    let params = new HttpParams();
    if (restaurantId) {
      params = params.set('restaurantId', restaurantId);
    }
    return this.http.get<Coupon[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.baseUrl}/${id}`);
  }

  create(coupon: CouponRequest): Observable<Coupon> {
    return this.http.post<Coupon>(this.baseUrl, coupon);
  }

  update(id: string, coupon: CouponRequest): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.baseUrl}/${id}`, coupon);
  }
}

