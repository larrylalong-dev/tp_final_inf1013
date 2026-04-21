# tp2_inf1013_microservice

Ce dossier contient les microservices du Jalon II.

## Services
- `auth-service` (port `8081`) : authentification JWT, profil utilisateur.
- `business-service` (port `8082`) : annonces + messagerie.

## Important
- Les deux services doivent partager la meme variable `JWT_SECRET`.

## Option A - Run local avec Docker Compose
```bash
cd tp2_inf1013_microservice
docker compose up --build
```

Services exposes:
- Auth API: `http://localhost:8081`
- Business API: `http://localhost:8082`
- PostgreSQL: `localhost:5432` (user/pass `tp`)

## Option B - Run local service par service (Maven)
```bash
cd auth-service
mvn spring-boot:run

cd ../business-service
mvn spring-boot:run
```

## Lancer les tests Maven
```bash
cd auth-service
mvn test

cd ../business-service
mvn test
```

## Tests API de bout en bout
Deux options dans `api-tests/`:
- `flow.http` (JetBrains HTTP Client)
- `smoke.sh` (script terminal)

```bash
cd tp2_inf1013_microservice
chmod +x api-tests/smoke.sh
./api-tests/smoke.sh
```

## Bascule Angular en mode API
Dans `tp1_inf1013/src/app/core/data-source.config.ts`, mettre:
- `auth: 'api'`
- `ads: 'api'`
- `messages: 'api'`

Et garder:
- `authBaseUrl: 'http://localhost:8081'`
- `businessBaseUrl: 'http://localhost:8082'`

## Deploy Railway (minimum)
Chaque service contient un `railway.json`:
- `auth-service/railway.json`
- `business-service/railway.json`

Variables a configurer sur Railway:
- `JWT_SECRET` (identique pour les deux services)
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver`

