# business-service

Microservice Spring Boot pour la logique metier des annonces et messages.

## Endpoints
- `GET /ads`
- `GET /ads/{id}`
- `GET /ads/mine` (JWT)
- `POST /ads` (JWT)
- `PUT /ads/{id}` (JWT owner)
- `DELETE /ads/{id}` (JWT owner)
- `PATCH /ads/{id}/active` (JWT owner)
- `POST /ads/{id}/views`
- `GET /ads/{id}/messages`
- `GET /messages` (JWT)
- `POST /messages` (JWT)

## Run local
```bash
mvn spring-boot:run
```

Par defaut le service tourne sur `http://localhost:8082` avec H2 en memoire.

## Variables utiles
- `JWT_SECRET` (doit etre identique a auth-service)
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME`

