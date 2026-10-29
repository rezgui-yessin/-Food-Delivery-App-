import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OrderStatus, OrderTrackingEvent } from '../models';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

export interface TrackingEventLog {
  message: string;
  status: OrderStatus;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService implements OnDestroy {
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  private eventSource: EventSource | null = null;
  private reconnectTimer: any = null;
  private readonly maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private currentOrderId: string | null = null;

  readonly trackingEvent = signal<OrderTrackingEvent | null>(null);
  readonly eventLog = signal<TrackingEventLog[]>([]);
  readonly connectionStatus = signal<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  connect(orderId: string): void {
    if (this.currentOrderId === orderId && this.eventSource?.readyState === EventSource.OPEN) {
      return;
    }

    this.disconnect();
    this.currentOrderId = orderId;
    this.reconnectAttempts = 0;
    this.openConnection(orderId);
  }

  private openConnection(orderId: string): void {
    const token = this.authService.token();
    const url = token
      ? `${environment.apiUrl}/orders/${orderId}/tracking?token=${encodeURIComponent(token)}`
      : `${environment.apiUrl}/orders/${orderId}/tracking`;

    this.connectionStatus.set('connecting');
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.connectionStatus.set('connected');
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as OrderTrackingEvent;
        this.trackingEvent.set(data);
        this.eventLog.update(log => [
          ...log,
          {
            message: data.message || `Status updated to ${data.status}`,
            status: data.status,
            timestamp: new Date()
          }
        ]);
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    this.eventSource.onerror = () => {
      this.connectionStatus.set('error');
      this.disconnect(false);

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectTimer = setTimeout(() => {
          if (this.currentOrderId) {
            this.openConnection(this.currentOrderId);
          }
        }, delay);
      } else {
        this.connectionStatus.set('disconnected');
        this.toastService.warning('Connection Lost', 'Live tracking disconnected. Please refresh for updates.');
      }
    };
  }

  disconnect(clearState = true): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (clearState) {
      this.connectionStatus.set('disconnected');
      this.currentOrderId = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
