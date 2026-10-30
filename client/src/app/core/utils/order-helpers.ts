import { Order, OrderItem, OrderStatus, PlatformStats, Restaurant } from '../models';

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.PICKED_UP,
  OrderStatus.OUT_FOR_DELIVERY
];

export function isActiveOrder(status: OrderStatus): boolean {
  return ACTIVE_ORDER_STATUSES.includes(status);
}

export function formatStatus(status: OrderStatus | string | undefined): string {
  return (status || '').replace(/_/g, ' ');
}

export function orderItemName(item: OrderItem): string {
  return item.name || item.menuItemName || 'Item';
}

export function formatMoney(value: number | undefined | null): string {
  return `$${(value ?? 0).toFixed(2)}`;
}

export function formatDateTime(value: string | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function shortOrderId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}

export function statusBadgeClass(status: OrderStatus): string {
  if (status === OrderStatus.DELIVERED) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  }
  if (status === OrderStatus.CANCELLED) {
    return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300';
  }
  if (isActiveOrder(status)) {
    return 'bg-primary/10 text-primary';
  }
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
}

export function derivePlatformStats(orders: Order[], restaurants: Restaurant[]): PlatformStats {
  const uniqueDrivers = new Set(orders.map(o => o.driverId).filter(Boolean));
  return {
    totalOrders: orders.length,
    totalRevenue: orders
      .filter(o => o.status !== OrderStatus.CANCELLED)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    activeRestaurants: restaurants.filter(r => r.open).length,
    totalRestaurants: restaurants.length,
    uniqueDrivers: uniqueDrivers.size,
    activeOrders: orders.filter(o => isActiveOrder(o.status)).length,
    deliveredOrders: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    cancelledOrders: orders.filter(o => o.status === OrderStatus.CANCELLED).length
  };
}

export function nextKitchenStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case OrderStatus.PLACED:
    case OrderStatus.PENDING:
      return OrderStatus.CONFIRMED;
    case OrderStatus.CONFIRMED:
      return OrderStatus.PREPARING;
    case OrderStatus.PREPARING:
      return OrderStatus.READY_FOR_PICKUP;
    default:
      return null;
  }
}

export function kitchenActionLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PLACED:
    case OrderStatus.PENDING:
      return 'Confirm order';
    case OrderStatus.CONFIRMED:
      return 'Start cooking';
    case OrderStatus.PREPARING:
      return 'Mark ready for pickup';
    default:
      return 'Update';
  }
}

export function nextDriverStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case OrderStatus.READY_FOR_PICKUP:
      return OrderStatus.PICKED_UP;
    case OrderStatus.PICKED_UP:
      return OrderStatus.OUT_FOR_DELIVERY;
    case OrderStatus.OUT_FOR_DELIVERY:
      return OrderStatus.DELIVERED;
    default:
      return null;
  }
}

export function driverActionLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.READY_FOR_PICKUP:
      return 'Mark picked up';
    case OrderStatus.PICKED_UP:
      return 'Start delivery';
    case OrderStatus.OUT_FOR_DELIVERY:
      return 'Mark delivered';
    default:
      return 'Update';
  }
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function dailyRevenueSeries(orders: Order[], days = 7): { label: string; value: number }[] {
  const series: { label: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const value = orders
      .filter(o => o.status !== OrderStatus.CANCELLED)
      .filter(o => {
        const created = new Date(o.createdAt);
        return created >= day && created < next;
      })
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    series.push({
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      value
    });
  }
  return series;
}
