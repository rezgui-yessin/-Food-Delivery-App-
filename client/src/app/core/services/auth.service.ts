import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Role, User } from '../models';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly tokenStorageKey = 'food_delivery_jwt';
  private readonly userStorageKey = 'food_delivery_user';

  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly currentUserSignal = signal<User | null>(this.getStoredUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal() && !!this.currentUserSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  readonly isCustomer = computed(() => this.userRole() === Role.CUSTOMER);
  readonly isRestaurantOwner = computed(() => this.userRole() === Role.RESTAURANT_OWNER);
  readonly isDeliveryDriver = computed(() => this.userRole() === Role.DELIVERY_DRIVER);
  readonly isAdmin = computed(() => this.userRole() === Role.ADMIN);

  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: Role): boolean {
    return this.userRole() === role;
  }

  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem(this.tokenStorageKey, authResponse.token);
    localStorage.setItem(this.userStorageKey, JSON.stringify(authResponse.user));
    this.tokenSignal.set(authResponse.token);
    this.currentUserSignal.set(authResponse.user);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.userStorageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}

