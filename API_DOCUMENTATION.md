# API Documentation - Plataforma Ciudadana de Transparencia

Esta documentación define todas las APIs REST que necesitas implementar en PHP para el backend de la plataforma.

## Configuración Base

**Base URL Development:** `http://localhost/api`  
**Base URL Production:** `https://your-domain.com/api`

**Headers requeridos:**
```
Content-Type: application/json
Authorization: Bearer {token} (cuando esté implementado auth)
```

---

## 1. COMPLAINTS API

### GET /complaints
Obtener lista de denuncias con filtros opcionales

**Query Parameters:**
- `category` (string): Filtrar por categoría
- `location` (string): Filtrar por ubicación
- `trending` (boolean): Solo denuncias trending
- `timeRange` (string): 'today', 'week', 'month', 'year'
- `limit` (number): Número de resultados (default: 10)
- `offset` (number): Offset para paginación (default: 0)

**Response:**
```json
[
  {
    "id": "string",
    "author": "string",
    "avatar": "string|null",
    "time": "string (relative time)",
    "category": "string",
    "location": "string",
    "content": "string",
    "entities": [
      {
        "type": "string",
        "value": "string",
        "icon": "string"
      }
    ],
    "likes": 0,
    "comments": 0,
    "shares": 0,
    "trending": false,
    "verified": false,
    "isAnonymous": false,
    "files": ["string"]
  }
]
```

### GET /complaints/{id}
Obtener denuncia específica

**Response:** Same as single complaint object above

### POST /complaints
Crear nueva denuncia

**Body:**
```json
{
  "content": "string",
  "category": "string",
  "location": "string",
  "isAnonymous": boolean,
  "files": ["string"] // URLs of uploaded files
}
```

**Response:** Single complaint object

### PUT /complaints/{id}
Actualizar denuncia existente

**Body:** Same as POST but partial

### DELETE /complaints/{id}
Eliminar denuncia

**Response:** 204 No Content

### POST /complaints/{id}/like
Toggle like en denuncia

**Response:**
```json
{
  "liked": boolean,
  "totalLikes": number
}
```

### GET /complaints/{id}/comments
Obtener comentarios de una denuncia

**Response:**
```json
[
  {
    "id": "string",
    "author": "string",
    "avatar": "string|null",
    "content": "string",
    "time": "string",
    "replies": []
  }
]
```

### POST /complaints/{id}/comments
Agregar comentario

**Body:**
```json
{
  "content": "string"
}
```

### POST /complaints/{id}/share
Compartir denuncia

**Response:**
```json
{
  "shareUrl": "string"
}
```

### GET /complaints/trending
Obtener denuncias trending

**Response:** Array of complaint objects

### POST /complaints/search
Buscar denuncias

**Body:**
```json
{
  "query": "string",
  "category": "string (optional)",
  "location": "string (optional)",
  "timeRange": "string (optional)"
}
```

### GET /complaints/categories
Obtener categorías disponibles

**Response:**
```json
[
  {
    "id": "string",
    "label": "string",
    "icon": "string",
    "color": "string"
  }
]
```

### POST /complaints/upload
Subir archivos para denuncias

**Body:** FormData with file

**Response:**
```json
{
  "url": "string",
  "filename": "string",
  "size": number
}
```

### POST /complaints/detect-entities
Detectar entidades en texto

**Body:**
```json
{
  "text": "string"
}
```

**Response:**
```json
[
  {
    "type": "string",
    "value": "string",
    "icon": "string"
  }
]
```

---

## 2. ANALYTICS API

### GET /analytics/dashboard
Obtener estadísticas principales del dashboard

**Response:**
```json
{
  "totalComplaints": number,
  "inProcess": number,
  "resolved": number,
  "resolutionRate": number,
  "todayComplaints": number,
  "trends": {
    "complaints": number,
    "resolution": number
  }
}
```

### GET /analytics/categories
Obtener distribución por categorías

**Response:**
```json
[
  {
    "name": "string",
    "value": number,
    "color": "string"
  }
]
```

### GET /analytics/timeline
Obtener datos de línea de tiempo

**Query Parameters:**
- `period` (string): 'week', 'month', 'year'

**Response:**
```json
[
  {
    "date": "string",
    "denuncias": number,
    "resueltas": number
  }
]
```

### GET /analytics/locations
Obtener datos por ubicación

**Response:**
```json
[
  {
    "location": "string",
    "count": number,
    "color": "string"
  }
]
```

### GET /analytics/trending
Obtener temas trending

**Response:**
```json
[
  {
    "tag": "string",
    "count": number
  }
]
```

### GET /analytics/alerts
Obtener alertas urgentes

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "severity": "alta|media|baja",
    "location": "string",
    "timestamp": "string"
  }
]
```

### GET /analytics/patterns
Obtener patrones detectados

**Response:**
```json
[
  {
    "id": "string",
    "type": "increase|correlation|improvement",
    "title": "string",
    "description": "string",
    "impact": "string",
    "confidence": number
  }
]
```

### GET /analytics/system-health
Obtener métricas de salud del sistema

**Response:**
```json
{
  "uptime": number,
  "responseTime": number,
  "errorRate": number,
  "activeUsers": number
}
```

### GET /analytics/users/me
Obtener estadísticas del usuario actual

**Response:**
```json
{
  "complaintsSubmitted": number,
  "resolutionsHelped": number,
  "transparencyPoints": number,
  "level": number,
  "nextLevelPoints": number,
  "badges": [
    {
      "id": "string",
      "name": "string",
      "icon": "string",
      "description": "string"
    }
  ]
}
```

### POST /analytics/reports
Generar reporte personalizado

**Body:**
```json
{
  "type": "category|location|timeline|full",
  "dateFrom": "string",
  "dateTo": "string",
  "categories": ["string"],
  "locations": ["string"]
}
```

**Response:**
```json
{
  "reportId": "string",
  "downloadUrl": "string"
}
```

---

## 3. GAMIFICATION API

### GET /gamification/profile
Obtener perfil del usuario

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "avatar": "string",
  "transparencyPoints": number,
  "level": number,
  "rank": number,
  "complaintsCount": number,
  "resolutionsCount": number,
  "badges": [],
  "achievements": []
}
```

### GET /gamification/leaderboard
Obtener tabla de posiciones

**Query Parameters:**
- `period` (string): 'week', 'month', 'all-time'

**Response:**
```json
{
  "period": "string",
  "entries": [
    {
      "rank": number,
      "user": {
        "id": "string",
        "name": "string",
        "avatar": "string",
        "transparencyPoints": number
      },
      "change": "up|down|same"
    }
  ],
  "userPosition": {
    "rank": number,
    "user": {},
    "change": "up|down|same"
  }
}
```

### GET /gamification/rankings
Obtener rankings por categoría

**Response:**
```json
{
  "complaints": [],
  "resolutions": [],
  "engagement": []
}
```

### GET /gamification/badges
Obtener insignias disponibles

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "icon": "string",
    "rarity": "common|uncommon|rare|epic|legendary",
    "unlockedAt": "string|null"
  }
]
```

### GET /gamification/achievements
Obtener logros del usuario

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "progress": number,
    "maxProgress": number,
    "reward": {
      "points": number,
      "badge": {}
    },
    "completed": boolean,
    "completedAt": "string|null"
  }
]
```

### GET /gamification/challenges
Obtener desafíos activos

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "daily|weekly|monthly|special",
    "requirements": {
      "type": "complaints|resolutions|engagement",
      "target": number,
      "current": number
    },
    "rewards": {
      "points": number,
      "badges": []
    },
    "startDate": "string",
    "endDate": "string",
    "participants": number,
    "completed": boolean
  }
]
```

### POST /gamification/challenges/{id}/join
Unirse a un desafío

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

### POST /gamification/challenges/{id}/complete
Completar un desafío

**Response:**
```json
{
  "success": boolean,
  "rewards": {
    "points": number,
    "badges": []
  }
}
```

### POST /gamification/award-points
Otorgar puntos por acciones

**Body:**
```json
{
  "action": "string",
  "data": {}
}
```

**Response:**
```json
{
  "pointsAwarded": number,
  "totalPoints": number,
  "levelUp": boolean,
  "newLevel": number,
  "badgesUnlocked": []
}
```

### GET /gamification/transparency-score
Obtener desglose de puntaje de transparencia

**Response:**
```json
{
  "total": number,
  "breakdown": {
    "complaints": number,
    "resolutions": number,
    "engagement": number,
    "verification": number
  },
  "history": [
    {
      "date": "string",
      "points": number,
      "action": "string"
    }
  ]
}
```

### GET /gamification/levels
Obtener información de progresión de niveles

**Response:**
```json
{
  "currentLevel": number,
  "currentPoints": number,
  "pointsForNextLevel": number,
  "totalPointsForNextLevel": number,
  "levelsUnlocked": [
    {
      "level": number,
      "name": "string",
      "description": "string",
      "perks": ["string"]
    }
  ]
}
```

---

## 4. AUTH API (Para futuro)

### POST /auth/login
### POST /auth/register
### POST /auth/logout
### GET /users/profile

---

## Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Notas de Implementación

1. **Autenticación**: Por ahora está opcional, pero preparado para JWT tokens
2. **File Uploads**: Usar FormData para subida de archivos
3. **Paginación**: Usar offset/limit pattern
4. **Filtros**: Query parameters opcionales
5. **CORS**: Configurar para permitir requests desde el frontend
6. **Rate Limiting**: Implementar límites de requests por IP/usuario
7. **Validación**: Validar todos los inputs del frontend
8. **Error Handling**: Retornar errores en formato JSON consistente

## Ejemplo de Error Response
```json
{
  "error": true,
  "message": "string",
  "code": "string",
  "details": {}
}
```