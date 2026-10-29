# Food Delivery App

A full-stack food delivery platform built with Angular on the frontend and Spring Boot on the backend, powered by MongoDB. The application supports customer ordering, restaurant management, driver tracking, and admin operations in a single monorepo.

## Overview

This project is designed to simulate a real-world food delivery ecosystem with:

- Customer browsing and ordering food
- Restaurant owner dashboard for menu and order management
- Delivery driver portal for live order handling
- Admin dashboard for oversight and control
- Secure authentication and role-based access
- Payment processing via Stripe
- Media uploads via Cloudinary
- API documentation through Swagger/OpenAPI

## Tech Stack

Frontend:
- Angular 18
- TypeScript
- Tailwind CSS
- RxJS
- Lucide Angular icons

Backend:
- Java 17
- Spring Boot 3
- Spring Security
- JWT authentication
- MongoDB
- Swagger / OpenAPI

Infrastructure:
- Docker
- Docker Compose
- Mongo Express

## Features

### Customer Experience
- Browse restaurants and food items
- View restaurant details and menus
- Add items to cart
- Place orders and checkout
- Track order progress
- Review order history

### Restaurant Owner
- Manage restaurant profile and menu
- Handle incoming orders
- Update restaurant information
- Monitor fulfillment flow

### Delivery Driver
- View assigned deliveries
- Accept and track orders
- Manage delivery status

### Admin
- Access administrative dashboard
- Monitor platform activity and operations
- Manage role-based system access

## Project Structure

```text
Food-Delivery-App/
├── client/                     # Angular frontend
│   ├── src/
│   ├── package.json
│   ├── angular.json
│   └── README.md
├── food-delivery-api/          # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   ├── Dockerfile
│   └── docker-compose.yml
├── docker-compose.yml         # Root Docker setup for MongoDB + API
├── .env.example               # Shared environment example
├── README.md                  # Project documentation
└── ...
```

## Architecture

The repository uses a modular full-stack architecture:

- Frontend: Angular SPA served locally on port 4200
- Backend: Spring Boot REST API served on port 8081
- Database: MongoDB on port 27017
- API Docs: Swagger UI available at http://localhost:8081/swagger-ui.html
- Database UI: Mongo Express available at http://localhost:8082

## Prerequisites

Before running the project, make sure you have installed:

- Node.js 18+
- npm
- Java 17+
- Maven
- Docker and Docker Compose
- Git

## Environment Configuration

Copy the example environment file and adjust the values as needed:

```bash
cp .env.example .env
```

The application uses settings for:

- JWT secret
- Stripe API key
- Stripe webhook secret
- Cloudinary credentials

You can also configure backend-specific credentials in:

```bash
cp food-delivery-api/.env.example food-delivery-api/.env
```

## Running the Application

### Option 1: Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

This will start:

- MongoDB
- Mongo Express
- Spring Boot API

### Option 2: Run Backend Manually

```bash
cd food-delivery-api
./mvnw clean install
./mvnw spring-boot:run
```

### Option 3: Run Frontend Manually

```bash
cd client
npm install
npm start
```

## Default Local URLs

- Frontend: http://localhost:4200
- Backend API: http://localhost:8081
- Swagger UI: http://localhost:8081/swagger-ui.html
- Mongo Express: http://localhost:8082

## Useful Commands

Frontend:

```bash
cd client
npm install
npm run build
npm test
```

Backend:

```bash
cd food-delivery-api
./mvnw test
./mvnw package
./mvnw spring-boot:run
```

## Notes

- The project includes Docker-based setup for quick local development.
- MongoDB is configured with a default database named `food_delivery_db`.
- Stripe and Cloudinary values are expected to be set in environment variables for production-ready usage.
- If you are using the app locally, keep the JWT secret and API credentials secure.

## Contributing

Contributions are welcome. If you want to improve the project, please fork the repository and open a pull request with clear changes and a summary of the update.

## Contact

For questions or collaboration related to this project, feel free to reach out through the repository owner profile or by opening an issue.
