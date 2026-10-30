# Frontend/backend capability notes

The Angular application is wired to the REST contracts exposed by the Spring Boot API. The following capabilities are now implemented by the customer API and Angular client:

- User profile updates and phone number
- Saved addresses with default-address support
- Favorite restaurants
- Restaurant reviews and ratings
- Order-status notifications and read state
- Order reorder
- Restaurant search endpoint with pagination, cuisine/open/rating/delivery-time filtering and sorting
- Delivery fee and estimated delivery time fields
- Restaurant-owner branding image upload and opening-hours management
- Restaurant-owner category CRUD, menu availability, stock, preparation-time, and sort-order fields
- Restaurant-owner analytics for daily revenue, weekly orders, average order value, and popular products
- Kitchen order notifications, kitchen mode, and printable order receipts
- Driver profile and vehicle information, online/offline availability, GPS sharing, delivery zones, earnings, rejection, delivery proof, and driver ratings
- Admin user/driver management, role editing, suspension and approval controls
- Restaurant approval workflow, audit log viewer, platform commission settings, reports, CSV export, browser print/PDF flow, and Stripe refund management

Remaining backend limitations:

- Account deletion and promotional notification campaigns are not implemented.
- Drag-and-drop menu ordering and a dedicated kitchen display route are not implemented; the owner dashboard currently provides inline menu controls and a kitchen-mode view.
- User/customer CRUD and role administration.
- Dedicated application-wide aggregate statistics and reporting endpoints.
- Driver map rendering currently uses browser geolocation and Google Maps links; a live in-app map provider is not configured.
- Delivery proof photo storage currently accepts a validated photo URL; multipart storage can be added when a driver camera upload policy is selected.
- Admin PDF export currently uses the browser print dialog; a server-side branded PDF generator is not configured.
- Payment history, payment retry intents, scheduled delivery timestamps, server-side tax/fee/commission calculation, COD/card selection, refund status, and downloadable customer receipts are implemented.
- Stored payment methods are not persisted locally; card details remain exclusively managed by Stripe for PCI safety.
- The home screen currently applies advanced rating and delivery-time filtering client-side; the backend search endpoint is available for pagination-scale integration.

Supported integrations include JWT authentication, role guards, restaurant and menu CRUD, menu image upload/delete, cart and checkout, coupon validation/management, Stripe payment intents, order status transitions, driver pickup workflows, and SSE order tracking.

Technical platform improvements now included:

- In-memory per-client API rate limiting (120 requests per minute) with HTTP 429 responses and `Retry-After`
- Consistent validation responses for malformed values and constraint violations
- Compound MongoDB indexes for restaurant, driver, status, and order-date queries
- Responsive offline/network-state banner and 429/connection error notifications
- Reusable standalone pagination control for large list screens
- Web app manifest and install prompt support for supported browsers

Infrastructure-dependent follow-ups:

- The rate limiter is intentionally process-local; Redis-backed distributed limiting should be enabled when multiple API instances are deployed.
- The manifest does not install a service worker or cache API responses; offline mode is status-aware rather than an offline data store.
- Automated email delivery, Redis caching, WebSocket transport, and Playwright execution still require provider/infrastructure and CI configuration.
