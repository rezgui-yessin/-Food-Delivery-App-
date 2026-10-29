import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentIntentResponse } from '../models';
import { ToastService } from './toast.service';

declare global {
  interface Window {
    Stripe?: (key: string) => any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly baseUrl = `${environment.apiUrl}/payments`;

  private stripe: any = null;
  private cardElement: any = null;

  readonly isStripeReady = signal<boolean>(false);
  readonly stripeError = signal<string | null>(null);

  async loadStripe(): Promise<any> {
    if (this.stripe) return this.stripe;

    // Dynamically load stripe.js
    await new Promise<void>((resolve, reject) => {
      if (window.Stripe) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));
      document.head.appendChild(script);
    });

    this.stripe = window.Stripe!(environment.stripePublishableKey);
    this.isStripeReady.set(true);
    return this.stripe;
  }

  async mountCardElement(elementId: string): Promise<void> {
    const stripe = await this.loadStripe();
    const elements = stripe.elements();

    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1e293b',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          '::placeholder': { color: '#94a3b8' },
          iconColor: '#FF5722'
        },
        invalid: { color: '#EF4444', iconColor: '#EF4444' }
      },
      hidePostalCode: false
    });

    this.cardElement.mount(`#${elementId}`);

    this.cardElement.on('change', (event: any) => {
      if (event.error) {
        this.stripeError.set(event.error.message);
      } else {
        this.stripeError.set(null);
      }
    });
  }

  unmountCardElement(): void {
    if (this.cardElement) {
      this.cardElement.unmount();
      this.cardElement = null;
    }
  }

  createPaymentIntent(orderId: string): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.baseUrl}/orders/${orderId}/create-intent`, {});
  }

  confirmTestPayment(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders/${orderId}/confirm-test`, {});
  }

  async confirmCardPayment(clientSecret: string, cardholderName: string): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe || !this.cardElement) {
      return { success: false, error: 'Stripe is not initialized' };
    }

    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
        billing_details: { name: cardholderName }
      }
    });

    if (result.error) {
      this.stripeError.set(result.error.message);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  }
}
