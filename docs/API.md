# TripAI Backend API Documentation

Base URL: `http://localhost:4000/api`

Authentication uses JWT. For protected routes, include:

`Authorization: Bearer <token>`

---

## Authentication

### Register
- Method: `POST`
- Path: `/auth/register`
- Auth: No

Request body:
```json
{
  "name": "Alex Rider",
  "email": "alex@example.com",
  "password": "Secret123!",
  "avatar": "https://example.com/avatar.png"
}
```

Response:
```json
{
  "user": {
    "id": "...",
    "name": "Alex Rider",
    "email": "alex@example.com",
    "avatar": "https://example.com/avatar.png",
    "role": "USER"
  },
  "token": "<jwt>"
}
```

### Login
- Method: `POST`
- Path: `/auth/login`
- Auth: No

Request body:
```json
{
  "email": "alex@example.com",
  "password": "Secret123!"
}
```

Response:
```json
{
  "user": {
    "id": "...",
    "name": "Alex Rider",
    "email": "alex@example.com",
    "avatar": "https://example.com/avatar.png",
    "role": "USER"
  },
  "token": "<jwt>"
}
```

---

## Destinations

### List destinations
- Method: `GET`
- Path: `/destinations`
- Auth: No

Query params:
- `location` string
- `price` range format `min-max` (example: `100-500`)
- `rating` range format `min-max` (example: `4-5`)
- `page` number
- `limit` number
- `sort` one of `price`, `rating`, `newest`

Response:
```json
{
  "items": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
```

### Get destination by id
- Method: `GET`
- Path: `/destinations/:id`
- Auth: No

### Create destination
- Method: `POST`
- Path: `/destinations`
- Auth: Admin only

Request body:
```json
{
  "title": "Ubud Escape",
  "description": "A cultural getaway",
  "location": "Bali",
  "price": 299,
  "rating": 4.7,
  "image": "https://example.com/ubud.jpg",
  "categoryId": "cat_id"
}
```

### Update destination
- Method: `PUT`
- Path: `/destinations/:id`
- Auth: Admin only

### Delete destination
- Method: `DELETE`
- Path: `/destinations/:id`
- Auth: Admin only

---

## Reviews

### Create review
- Method: `POST`
- Path: `/reviews`
- Auth: Required

Request body:
```json
{
  "destinationId": "dest_id",
  "rating": 5,
  "comment": "Amazing place!"
}
```

### List reviews by destination
- Method: `GET`
- Path: `/reviews/:destinationId`
- Auth: No

---

## Saved Trips

### Save destination
- Method: `POST`
- Path: `/saved`
- Auth: Required

Request body:
```json
{
  "destinationId": "dest_id"
}
```

### List saved trips for user
- Method: `GET`
- Path: `/saved/user`
- Auth: Required

### Unsave destination
- Method: `DELETE`
- Path: `/saved/:destinationId`
- Auth: Required

---

## AI Travel Suggestions

### Generate itinerary
- Method: `POST`
- Path: `/ai/travel-suggestion`
- Auth: Required
- Rate limit: 20 requests per 15 minutes

Request body:
```json
{
  "prompt": "Plan a 3 day trip to Bali",
  "preferences": {
    "budget": "mid-range",
    "interests": ["beaches", "culture"],
    "travelStyle": "relaxed",
    "pace": "slow",
    "withKids": false,
    "currency": "USD"
  }
}
```

Response: structured itinerary JSON

### Stream itinerary
- Method: `POST`
- Path: `/ai/travel-suggestion/stream`
- Auth: Required
- Rate limit: 20 requests per 15 minutes
- Response type: `text/event-stream`

SSE events:
- `meta`
- `day`
- `tips`
- `budget`
- `done`

---

## Common Responses

### 401 Unauthorized
Returned when a JWT is missing or invalid.

### 403 Forbidden
Returned when the user does not have required role.

### 404 Not Found
Returned when a resource does not exist.

### 409 Conflict
Returned for duplicate entries (e.g., category exists, saved trip exists).
