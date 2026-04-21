# auth-service

Microservice Spring Boot pour l'authentification JWT.

## Endpoints
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `GET /auth/me`
- `PUT /auth/me`

## Run local
```bash
mvn spring-boot:run
```

Par defaut le service tourne sur `http://localhost:8081` avec H2 en memoire.

## Variables utiles
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_EXPIRATION_MS`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME`

