#!/usr/bin/env zsh
set -euo pipefail

AUTH_BASE_URL="${AUTH_BASE_URL:-http://localhost:8081}"
BUSINESS_BASE_URL="${BUSINESS_BASE_URL:-http://localhost:8082}"
EMAIL="testuser+$(date +%s)@mail.com"
PASSWORD="test1234"

register_payload=$(cat <<JSON
{
  "firstName": "Test",
  "lastName": "User",
  "phone": "514 111 2222",
  "email": "${EMAIL}",
  "address": "123 Rue Test, Montreal",
  "password": "${PASSWORD}"
}
JSON
)

register_response=$(curl -sS -X POST "${AUTH_BASE_URL}/auth/register" \
  -H 'Content-Type: application/json' \
  -d "${register_payload}")

token=$(echo "${register_response}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["accessToken"])')
owner_id=$(echo "${register_response}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["user"]["id"])')

ad_payload=$(cat <<JSON
{
  "title": "Condo test",
  "shortDescription": "Condo moderne proche du metro",
  "longDescription": "Annonce de test pour valider le flux microservices de bout en bout.",
  "monthlyRent": 1450,
  "availableFrom": "2026-05-01",
  "photos": ["https://picsum.photos/seed/tp/800/600"],
  "locationAddress": "100 Rue Sainte-Catherine O, Montreal, H2X 1Z6",
  "street": "100 Rue Sainte-Catherine O",
  "city": "Montreal",
  "postalCode": "H2X 1Z6",
  "ownerId": "${owner_id}",
  "isActive": true,
  "views": 0
}
JSON
)

ad_response=$(curl -sS -X POST "${BUSINESS_BASE_URL}/ads" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${token}" \
  -d "${ad_payload}")

ad_id=$(echo "${ad_response}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')

message_payload=$(cat <<JSON
{
  "adId": "${ad_id}",
  "ownerId": "${owner_id}",
  "subject": "Interesse par votre logement",
  "body": "Bonjour, est-ce possible de visiter ce vendredi soir ?"
}
JSON
)

curl -sS -X POST "${BUSINESS_BASE_URL}/messages" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${token}" \
  -d "${message_payload}" >/dev/null

count=$(curl -sS -H "Authorization: Bearer ${token}" "${BUSINESS_BASE_URL}/ads/${ad_id}/messages" | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))')

echo "OK - flow complet valide, messages trouves: ${count}"

