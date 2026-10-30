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
  phone?: string;
  active?: boolean;
  approved?: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  active: boolean;
  approved: boolean;
  driverAvailable: boolean;
  vehicleType?: string;
  vehiclePlate?: string;
  deliveryZone?: string;
  latitude?: number;
  longitude?: number;
}

export interface AdminUserCreateRequest {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  active?: boolean;
  approved?: boolean;
}

export interface AdminReport {
  users: number;
  customers: number;
  drivers: number;
  restaurants: number;
  orders: number;
  grossRevenue: number;
  commissionRevenue: number;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  createdAt: string;
}

export interface PlatformSettings {
  commissionRate: number;
  currency: string;
}

export interface DriverProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  available: boolean;
  latitude?: number;
  longitude?: number;
  deliveryZone?: string;
  rating?: number;
}

export interface DriverEarnings {
  completedDeliveries: number;
  totalEarnings: number;
  averageEarnings: number;
  currency: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface AddressRequest {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Review {
  id: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Restaurant {
  id: string;
  ownerId?: string;
  name: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  cuisineType: string;
  open: boolean;
  approved?: boolean;
  imageUrl?: string;
  rating?: number;
  deliveryTimeMin?: number;
  minOrder?: number;
  deliveryFee?: number;
  openingHours?: Record<string, string>;
}

export interface RestaurantRequest {
  name: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  cuisineType: string;
  open: boolean;
  openingHours?: Record<string, string>;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
  stockQuantity?: number;
  preparationTimeMinutes?: number;
  sortOrder?: number;
}

export interface MenuItemRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  stockQuantity?: number;
  preparationTimeMinutes?: number;
  sortOrder?: number;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder: number;
  active: boolean;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  sortOrder: number;
  active: boolean;
}

export interface RestaurantAnalytics {
  dailyRevenue: number;
  weeklyOrders: number;
  averageOrderValue: number;
  popularProducts: { name: string; quantity: number; revenue: number }[];
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
  menuItemId: string;
  name: string;
  menuItemName?: string;
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
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  restaurantLatitude?: number;
  restaurantLongitude?: number;
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
  deliveryProofAt?: string;
  deliveryProofSignature?: string;
  deliveryProofPhotoUrl?: string;
  deliveryProofCode?: string;
  createdAt: string;
  updatedAt: string;
  deliveryFee?: number;
  taxAmount?: number;
  commissionAmount?: number;
  estimatedDeliveryMinutes?: number;
  scheduledAt?: string;
}

export interface OrderCreateRequest {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  paymentMethod: PaymentMethod;
  couponCode?: string;
  scheduledAt?: string;
}

export interface PaymentHistoryEntry extends Order {}

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
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  restaurantId?: string;
  startDate?: string;
  expiryDate?: string;
  maxUsageCount?: number;
  usageCount?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponRequest {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  restaurantId?: string;
  startDate?: string;
  expiryDate?: string;
  maxUsageCount?: number;
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

export interface PlatformStats {
  totalOrders: number;
  totalRevenue: number;
  activeRestaurants: number;
  totalRestaurants: number;
  uniqueDrivers: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}
