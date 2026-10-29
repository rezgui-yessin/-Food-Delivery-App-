export enum Role {
  CUSTOMER = 'CUSTOMER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  DELIVERY_DRIVER = 'DELIVERY_DRIVER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PLACED = 'PLACED',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  PICKED_UP = 'PICKED_UP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  cuisineType: string;
  open: boolean;
  ownerId?: string;
  rating?: number;
  deliveryTimeMin?: number;
  minOrder?: number;
  imageUrl?: string;
}

export interface RestaurantRequest {
  name: string;
  description: string;
  address: string;
  phone: string;
  cuisineType: string;
  open: boolean;
  ownerId?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
}

export interface MenuItemRequest {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  specialInstructions?: string;
}

export interface Cart {
  customerId: string;
  restaurantId?: string;
  restaurantName?: string;
  items: CartItem[];
  totalAmount: number;
}

export interface OrderItem {
  id?: string;
  menuItemId: string;
  menuItemName: string;
  name?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  driverId?: string;
  driverName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreateRequest {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export interface OrderTrackingEvent {
  orderId: string;
  status: OrderStatus;
  driverId?: string;
  driverName?: string;
  updatedAt: string;
  message: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  restaurantId?: string;
  minOrderAmount?: number;
  expiryDate?: string;
  active: boolean;
}

export interface CouponRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  restaurantId?: string;
  minOrderAmount?: number;
  expiryDate?: string;
  active: boolean;
}

export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  calculatedDiscount: number;
  finalTotal: number;
  message?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string | null;
  paymentIntentId: string | null;
  amount: number;
  currency: string;
  orderId: string;
  paymentStatus: PaymentStatus;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

