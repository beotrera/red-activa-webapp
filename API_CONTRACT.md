# RedActiva — Contrato de API

> Este documento define el contrato entre el frontend (`red-activa-webapp`) y el backend (`red-activa-backend`).
> Cualquier cambio en un endpoint debe reflejarse aquí antes de implementarse en ambos lados.
>
> **Base URL:** `http://localhost:3001/api`
> **Autenticación:** Bearer JWT en el header `Authorization: Bearer <token>`
> **Envelope de respuesta:** todos los endpoints devuelven el mismo wrapper:

```json
{
  "result": true,
  "data": <payload>,
  "errorCode": null,
  "message": null,
  "showMessage": { "EN": "...", "ES": "..." },
  "needUpdate": false
}
```

---

## Índice

- [Auth](#auth)
- [Personas (NN)](#personas-nn)
- [Reportes ciudadanos](#reportes-ciudadanos)
- [Analytics](#analytics)
  - [📌 CAMBIO PROPUESTO — by-neighborhood + polygon](#-cambio-propuesto--by-neighborhood--polygon)

---

## Auth

### `POST /auth/login`
Autentica un usuario institucional. **No requiere token.**

**Request body**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response `data`**
```ts
{
  id: string
  email: string
  fullName: string
  role: "DOCTOR" | "NURSE" | "ADMINISTRATOR" | "SOCIAL_WORKER" | "PSYCHOLOGIST"
  gender?: "MALE" | "FEMALE"
  entity: string          // nombre de la institución
  avatarUrl?: string
  token: string           // JWT — el frontend lo almacena en Redux y lo envía en cada request
}
```

---

### `POST /auth/logout`
Invalida la sesión. **Requiere token.**

**Response `data`**
```ts
{ message: string }
```

---

## Personas (NN)

### `GET /persons`
Listado de personas no identificadas. **Requiere token.**

**Query params opcionales**
| Param | Tipo | Descripción |
|---|---|---|
| `status` | `"UNIDENTIFIED" \| "POTENTIAL_MATCH" \| "IDENTIFIED"` | Filtra por estado |
| `gender` | `"MALE" \| "FEMALE"` | Filtra por género |

**Response `data`** — array de `Person`:
```ts
{
  _id: string             // el frontend lo normaliza como `id`
  estimatedAgeMin: number
  estimatedAgeMax: number
  gender: "MALE" | "FEMALE"
  height?: number         // en metros
  weight?: number         // en kg
  distinctiveFeatures: string
  consciousnessLevel: "CONSCIOUS" | "DISORIENTED" | "UNCONSCIOUS" | "SEDATED"
  address: string
  neighborhood: string
  geoLocation?: {
    type: "Point"
    coordinates: [number, number]  // [longitud, latitud]
  }
  institution?: string | Institution
  dateOfAdmission: string          // ISO 8601
  status: "UNIDENTIFIED" | "POTENTIAL_MATCH" | "IDENTIFIED"
  reportedBy: string
  assignedTo?: string
  identifyingPhotos?: Array<{
    url: string
    caption?: string
    uploadedAt: string
  }>
  createdBy?: string | { _id: string; firstName: string; lastName: string; email: string }
  createdAt?: string
  updatedAt?: string
}
```

---

### `POST /persons`
Alta de persona no identificada. **Requiere token.** Envía `multipart/form-data`.

**Form fields**
| Campo | Tipo | Requerido |
|---|---|---|
| `estimatedAgeMin` | number | ✅ |
| `estimatedAgeMax` | number | ✅ |
| `gender` | `"MALE" \| "FEMALE"` | ✅ |
| `distinctiveFeatures` | string | ✅ |
| `consciousnessLevel` | string | ✅ |
| `height` | number | ❌ |
| `weight` | number | ❌ |
| `images` | File[] | ❌ |

**Response `data`** — `Person` (ver arriba)

---

### `GET /persons/:id`
Detalle de una persona. **Requiere token.**

**Response `data`** — `Person`

---

### `PUT /persons/:id`
Actualiza datos de una persona. **Requiere token.**

**Request body** (todos opcionales)
```ts
{
  estimatedAgeMin?: number
  estimatedAgeMax?: number
  gender?: "MALE" | "FEMALE"
  height?: number
  weight?: number
  distinctiveFeatures?: string
  consciousnessLevel?: string
  status?: "UNIDENTIFIED" | "POTENTIAL_MATCH" | "IDENTIFIED"
  assignedTo?: string
}
```

**Response `data`** — `Person` actualizado

---

### `GET /persons/:id/similarities`
Cruces de similitud calculados por el algoritmo. **Requiere token.**

**Response `data`** — array de `Similarity`:
```ts
{
  _id: string
  person: string          // id de la persona NN
  report: {
    _id: string
    fullName: string
    description: string
    neighborhood: string
    gender?: "MALE" | "FEMALE"
    estimatedAge?: number
    lastSeenDate?: string
  }
  score: number           // 1–100
  differences: string[]
  reasoning: string
  createdAt: string
  updatedAt: string
}
```

---

## Reportes ciudadanos

### `GET /reports`
Listado de reportes de personas desaparecidas. **Requiere token.**

**Response `data`** — array de `Report`:
```ts
{
  _id: string
  fullName: string
  description: string
  picture: string
  neighborhood: string
  lastSeenDate?: string
  gender?: "MALE" | "FEMALE"
  estimatedAge?: number
  height?: number
  weight?: number
  createdAt: string
  updatedAt: string
}
```

---

### `GET /reports/:id`
Detalle de un reporte. **Requiere token.**

**Response `data`** — `Report`

---

## Analytics

### `GET /analytics/summary`
Totales globales. **Requiere token.**

**Response `data`**
```ts
{
  totalPersons: number
  totalReports: number
  totalMatches: number
}
```

---

### `GET /analytics/heatmap`
Datos para visualización de calor. **Requiere token.**

**Response `data`** — array de puntos:
```ts
Array<{
  coordinates: [number, number]   // [longitud, latitud]
  weight: number
}>
```

---

### `GET /analytics/by-neighborhood`
Actividad agrupada por barrio. **Requiere token.**

**Response `data`** actual:
```ts
Array<{
  neighborhood: string
  nn: number
  reports: number
  coordinates: [number, number] | null   // [longitud, latitud] — centroide
  comuna: number | null
}>
```

---

## 📌 CAMBIO PROPUESTO — `by-neighborhood` + polygon

> **Para quién:** Braian (backend)
> **Motivación:** el frontend quiere renderizar un mapa SVG con los polígonos reales de cada barrio para reemplazar el mapa de Leaflet/OpenStreetMap. El backend ya tiene estos polígonos en MongoDB (se usan para identificar el barrio de un NN o reporte por geolocalización). Solo hace falta exponerlos en este endpoint.

### Lo que hay que agregar

En el array de resultados de `/analytics/by-neighborhood`, incluir el campo `polygon` con el contorno del barrio en formato GeoJSON (el mismo que ya está en la colección de barrios en Mongo):

**Response `data` propuesto:**
```ts
Array<{
  neighborhood: string
  nn: number
  reports: number
  coordinates: [number, number] | null     // [longitud, latitud] — centroide (ya existe)
  polygon: [number, number][] | null       // ← NUEVO: array de [longitud, latitud] del contorno
  comuna: number | null
}>
```

**Ejemplo de respuesta esperada:**
```json
[
  {
    "neighborhood": "Palermo",
    "nn": 3,
    "reports": 2,
    "coordinates": [-58.4173, -34.5848],
    "polygon": [
      [-58.398, -34.568],
      [-58.421, -34.564],
      [-58.435, -34.578],
      [-58.428, -34.601],
      [-58.402, -34.598],
      [-58.391, -34.582],
      [-58.398, -34.568]
    ],
    "comuna": 14
  }
]
```

> ⚠️ El polígono debe ser un **anillo cerrado** (el primer y último punto son iguales), igual que el estándar GeoJSON.
> Si el barrio no tiene polígono, devolver `null` — el frontend lo omite sin romper.

### Pseudocódigo backend (referencia)

```js
// En el aggregation pipeline o en el map de resultados:
{
  neighborhood: barrio.name,
  nn: countNN,
  reports: countReports,
  coordinates: barrio.centroid?.coordinates ?? null,   // ya existe
  polygon: barrio.boundary?.coordinates?.[0] ?? null,  // ← agregar esto
  comuna: barrio.comuna ?? null,
}
```

> `barrio.boundary` es el campo GeoJSON tipo `Polygon` que ya existe en la colección.
> `coordinates[0]` es el anillo exterior (el contorno), que es lo que necesitamos.

---

## Notas generales

| Tema | Detalle |
|---|---|
| Formato de fechas | ISO 8601 (`2026-06-24T03:00:00.000Z`) |
| Coordenadas | Siempre en orden GeoJSON: `[longitud, latitud]`. El frontend invierte cuando Leaflet lo requiere. |
| IDs | MongoDB ObjectId como string. El frontend normaliza `_id` → `id`. |
| Imágenes | URLs relativas al host del backend (sin `/api`). El frontend las prefija con `STATIC_BASE`. |
| Paginación | Ningún endpoint pagina actualmente. |
