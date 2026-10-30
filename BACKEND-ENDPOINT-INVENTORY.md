# Verified backend endpoint inventory

The backend uses MongoDB (`spring.data.mongodb.uri` in `food-delivery-api/src/main/resources/application.properties`), not PostgreSQL. This inventory was verified from the controller source.

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register customer, restaurant owner, or delivery driver |
| POST | `/api/auth/login` | Issue JWT |

## Customer, cart, orders, and reviews

| Method | Endpoint | Purpose |
|---|---|---|
| PUT | `/api/users/me` | Update profile |
| GET/POST/PUT/DELETE | `/api/users/me/addresses[/{id}]` | Address CRUD |
| GET | `/api/users/me/favorites` | List favorites |
| POST | `/api/users/me/favorites/{restaurantId}` | Toggle favorite |
| GET | `/api/users/me/notifications` | List notifications |
| PATCH | `/api/users/me/notifications/{id}/read` | Mark notification read |
| GET/POST | `/api/restaurants/{restaurantId}/reviews` | List/create review |
| GET/POST/PUT/DELETE | `/api/cart`, `/api/cart/items[/{menuItemId}]` | Cart operations |
| POST | `/api/cart/checkout` | Create order from cart |
| GET | `/api/orders`, `/api/orders/{id}` | Customer/role-scoped orders |
| POST | `/api/orders/{id}/reorder` | Reorder |
| PATCH | `/api/orders/{id}/status` | Authorized status transition |
| GET | `/api/orders/{id}/tracking` | SSE tracking |

## Restaurants, categories, menu, and coupons

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/restaurants`, `/api/restaurants/{id}` | Browse restaurant data |
| GET | `/api/restaurants/search` | Search, filtering, sorting, page/size |
| POST/PUT/DELETE | `/api/restaurants[/{id}]` | Owner/admin restaurant CRUD |
| POST | `/api/restaurants/{id}/image` | Restaurant image upload |
| PUT | `/api/restaurants/{id}/hours` | Opening hours |
| GET/POST/PUT/DELETE | `/api/restaurants/{restaurantId}/categories[/{id}]` | Category CRUD |
| GET/POST/PUT/DELETE | `/api/restaurants/{restaurantId}/menu-items[/{id}]` | Menu item CRUD |
| PATCH | `/api/restaurants/{restaurantId}/menu-items/{id}/availability` | Availability toggle |
| POST/DELETE | `/api/restaurants/{restaurantId}/menu-items/{id}/image` | Menu image management |
| GET/POST/PUT/DELETE | `/api/coupons[/{id}]` | Coupon CRUD |
| GET | `/api/coupons/validate` | Validate coupon |
| GET | `/api/restaurants/{restaurantId}/analytics` | Owner analytics |

## Driver, payment, and administration

| Method | Endpoint | Purpose |
|---|---|---|
| GET/PUT | `/api/drivers/me` | Driver profile |
| PATCH | `/api/drivers/me/availability` | Online/offline state |
| PATCH | `/api/drivers/me/location` | GPS update |
| GET | `/api/drivers/me/earnings` | Earnings |
| GET | `/api/orders/available-for-pickup` | Available deliveries |
| GET | `/api/orders/my-deliveries` | Driver deliveries |
| POST | `/api/orders/{id}/accept` or `/reject` | Delivery assignment decision |
| POST | `/api/drivers/deliveries/{orderId}/proof` | Proof of delivery |
| POST | `/api/drivers/{driverId}/ratings` | Driver rating |
| GET | `/api/payments/history` | Payment/order history |
| POST | `/api/payments/orders/{orderId}/create-intent` or `/retry` | Stripe intent |
| POST | `/api/payments/orders/{orderId}/confirm-test` | Test payment confirmation |
| GET/POST/PUT/DELETE | `/api/admin/users[/{id}]` | Admin user CRUD, filtering, role/status management |
| GET/PATCH | `/api/admin/restaurants[/{id}/approval]` | Restaurant approvals |
| GET | `/api/admin/audit-logs`, `/api/admin/reports`, `/api/admin/settings` | Administration data |
| PUT | `/api/admin/settings` | Platform settings |
| POST | `/api/admin/orders/{id}/refund` | Refund |
| POST | `/api/webhooks/stripe` | Stripe webhook |

The repeatable REST-only demo population script is [populate-demo-data.ps1](scripts/populate-demo-data.ps1). It never writes directly to MongoDB, skips existing named demo records, uses cash-on-delivery for the sample order, and does not perform real Stripe transactions.
