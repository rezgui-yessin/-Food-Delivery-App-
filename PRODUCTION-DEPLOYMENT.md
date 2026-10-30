# Production deployment

The production stack uses Caddy for automatic HTTPS certificates from Let's Encrypt. It exposes only Caddy publicly; MongoDB and the Spring Boot API stay on the private Docker network.

## Prerequisites

- A Linux server with Docker Engine and the Docker Compose plugin.
- DNS `A`/`AAAA` records for `DOMAIN` pointing to the server.
- TCP ports 80 and 443 open in the firewall.

## Deploy

Create the local production environment file first. It is intentionally ignored by Git because it contains secrets.

Git Bash:

```bash
cp .env.production.example .env.production
```

PowerShell:

```powershell
Copy-Item .env.production.example .env.production
```

Edit `.env.production` and replace every `replace_me` value with real production credentials. Then validate and start the stack:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml config
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Open `https://DOMAIN`. Caddy obtains and renews the certificate automatically.

## Operations

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f caddy
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f api
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Do not run `down -v` unless the MongoDB and Caddy data volumes are intentionally being destroyed.
## Live maps

Set `googleMapsApiKey` in the frontend environment files to a browser key restricted
to the production domain, with Maps JavaScript API and Directions API enabled.
The key is public browser configuration; restrict it by HTTP referrer and API scope.
