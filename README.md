# RedActiva — Web App

> Frontend de RedActiva: interfaz para el registro de personas no identificadas en instituciones y el reporte ciudadano de personas desaparecidas. Consume la API REST de [red-activa-backend](https://github.com/CoachEmilio/red-activa-backend).

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white)

---

## Índice

- [Descripción del proyecto](#descripción-del-proyecto)
- [Relación con el backend](#relación-con-el-backend)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Páginas y componentes](#páginas-y-componentes)
- [Nota de voz por paciente](#nota-de-voz-por-paciente)
- [Conexión con la API](#conexión-con-la-api)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)

---

## Descripción del proyecto

**RedActiva Web App** es la capa de presentación del sistema RedActiva. Permite a las instituciones (hospitales, refugios, comisarías) registrar y consultar personas no identificadas (**N.N.**), y cruzar esos registros contra reportes ciudadanos de personas desaparecidas. La aplicación consume la API del backend, que persiste los datos en MongoDB y ejecuta un algoritmo de similitud compuesta.

**Materia:** Ingeniería de Datos II — Datos No Relacionales  
**Profesor Titular:** Bueno, Moises Evaristo  
**Profesor Auxiliar:** Arenales, Federico Humberto  
**Grupo 9 — Integrantes:** Di Pasquasio, Federico Gabriel · Diaz Seoane, Agustin Edgardo · Otrera, Braian · Romero Quirino, Luis Emilio · Zarraga, Manuel Alejandro

---

## Relación con el backend

Este repositorio es **únicamente el frontend**. No tiene base de datos propia ni lógica de negocio.

```
Usuario (navegador)
    └─> RedActiva Web App (React + Vite)
          └─> hooks/useApi.ts  (TanStack Query + fetch)
                └─> API REST red-activa-backend (http://localhost:3001/api)
                      └─> MongoDB
```

Para usar la app es necesario tener el **backend corriendo** (ver su README).

---

## Stack tecnológico

| Tecnología        | Versión  | Rol                                           |
| ----------------- | -------- | --------------------------------------------- |
| React             | 19       | Librería de UI                                |
| TypeScript        | 5.x      | Lenguaje                                      |
| Vite              | 6.x      | Build tool / dev server                       |
| Tailwind CSS      | 4.x      | Estilos utilitarios                           |
| Redux Toolkit     | 2.x      | Estado global de autenticación (JWT)          |
| React Router      | 7.x      | Ruteo entre páginas                           |
| TanStack Query    | 5.x      | Fetching, caché y sincronización con la API   |
| Lucide React      | —        | Íconos                                        |

> Las versiones exactas están en `package.json`.

---

## Estructura del proyecto

```
red-activa-webapp/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CabaMap.tsx           # Mapa SVG interactivo de CABA (polígonos por barrio)
│   │   ├── Footer.tsx
│   │   ├── Header.tsx            # Navbar con NavLinks y estado activo
│   │   ├── LocationMap.tsx
│   │   ├── Login.tsx
│   │   ├── NNDetail.tsx
│   │   ├── PersonAudioPlayer.tsx # Reproductor de nota de voz con gestión de object URL
│   │   └── PulseLoader.tsx
│   ├── hooks/
│   │   ├── useApi.ts             # Hooks de TanStack Query para cada endpoint
│   │   ├── useAudioRecorder.ts   # Grabación de audio vía MediaRecorder (estados, timer, límites)
│   │   └── useAppDispatch.ts     # Dispatch tipado de Redux
│   ├── pages/
│   │   ├── DashboardPage.tsx    # Panel principal: KPIs, mapa, tabla por barrio
│   │   ├── NNAdmissionPage.tsx  # Alta de persona no identificada
│   │   ├── NNDetailPage.tsx     # Detalle de N.N. y cruces de similitud
│   │   └── NNListPage.tsx       # Tabla compacta de expedientes N.N.
│   ├── store/
│   │   ├── authSlice.ts       # Slice de autenticación (JWT)
│   │   └── index.ts           # Store de Redux
│   ├── utils/
│   │   └── api.ts             # Funciones fetch centralizadas
│   ├── App.tsx                # Rutas y layout
│   ├── main.tsx               # Entry point
│   ├── types.ts               # Tipos compartidos (enums, interfaces)
│   └── index.css
├── API_CONTRACT.md            # Contrato de endpoints entre frontend y backend
├── .env.example
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Páginas y componentes

| Elemento            | Ruta           | Rol                                                                      |
| ------------------- | -------------- | ------------------------------------------------------------------------ |
| `DashboardPage`     | `/`            | KPIs globales, mapa SVG de CABA y tabla de actividad por barrio          |
| `NNListPage`        | `/nn`          | Tabla compacta de expedientes N.N. con búsqueda y filtros de estado      |
| `NNDetailPage`      | `/nn/:id`      | Detalle de N.N., fotos, cruces de similitud con reportes ciudadanos       |
| `NNAdmissionPage`   | `/admision`    | Alta de nueva persona no identificada (`POST /persons`)                   |
| `CabaMap`           | —              | Mapa SVG puro de los 48 barrios de CABA con intensidad de actividad       |
| `Header`            | —              | Barra de navegación con links activos (Panel / Expedientes / Admitir NN) |
| `Login`             | `/login`       | Autenticación contra `/auth/login` (JWT guardado en Redux)               |
| `PulseLoader`       | —              | Indicador de carga reutilizable                                           |

> N.N. = persona no identificada, modelo `Person` del backend.

---

## Nota de voz por paciente

Al registrar o consultar un paciente N.N., el personal de salud puede adjuntar una **nota de voz** que queda vinculada al expediente.

### Grabación (alta de paciente — `NNAdmissionPage`)

- El formulario de admisión incluye un grabador de audio integrado.
- Al pulsar **Grabar audio**, el navegador solicita permiso al micrófono y comienza la captura usando la API nativa `MediaRecorder`.
- El audio se acumula como chunks de datos binarios. Al detener la grabación, los chunks se ensamblan en un `Blob` (bytes crudos) y se envuelven en un `File`.
- El archivo se sube junto al resto del formulario en la misma mutación: primero `POST /persons` (que crea el registro), y luego `POST /persons/:id/audio` con el audio en `multipart/form-data`.
- Límites: **2 minutos** de duración máxima · **5 MB** de tamaño máximo.
- El formato se elige automáticamente según el navegador: `webm`, `mp4` o `ogg`.

### Reproducción (detalle de paciente — `NNDetail`)

- Al abrir el detalle de un paciente, el hook `usePersonAudio` consulta `GET /persons/:id/audio`.
- El servidor devuelve los **bytes crudos** del audio (no JSON). El frontend los recibe como `Blob`, genera una URL temporal en memoria con `URL.createObjectURL()` y la asigna a un `<audio controls>` estándar.
- La URL temporal se libera con `URL.revokeObjectURL()` cuando el componente se desmonta, evitando fugas de memoria.
- Si el paciente no tiene audio adjunto (código de error `5001`), la sección no se muestra.

### Archivos involucrados

| Archivo | Rol |
| --- | --- |
| `src/hooks/useAudioRecorder.ts` | Lógica de grabación: estados, timer, límites, limpieza |
| `src/components/PersonAudioPlayer.tsx` | Gestión del ciclo de vida del object URL y renderizado del `<audio>` |
| `src/utils/api.ts` — `uploadPersonAudio` | `POST /persons/:id/audio` con `FormData` |
| `src/utils/api.ts` — `fetchPersonAudioBlob` | `GET /persons/:id/audio` → `Blob` |
| `src/hooks/useApi.ts` — `usePersonAudio` | Hook TanStack Query con caché de 30 s |
| `src/pages/NNAdmissionPage.tsx` | UI del grabador en el formulario de alta |
| `src/components/NNDetail.tsx` | Sección "Nota de voz" en el detalle del paciente |

---

## Conexión con la API

Las llamadas se centralizan en `src/hooks/useApi.ts` (TanStack Query) y `src/utils/api.ts` (fetch). Todos los requests adjuntan el token JWT en el header `Authorization: Bearer <token>`.

Endpoints principales consumidos:

| Método | Endpoint                        | Uso                                      |
| ------ | ------------------------------- | ---------------------------------------- |
| POST   | `/auth/login`                   | Autenticación                            |
| GET    | `/persons`                      | Listado de N.N.                          |
| GET    | `/persons/:id`                  | Detalle de N.N.                          |
| GET    | `/persons/:id/similarities`     | Cruces con reportes ciudadanos           |
| POST   | `/persons`                      | Alta de N.N.                             |
| POST   | `/persons/:id/audio`            | Subida de nota de voz (binario)          |
| GET    | `/persons/:id/audio`            | Descarga de nota de voz (bytes crudos)   |
| GET    | `/reports`                      | Reportes ciudadanos                      |
| GET    | `/analytics/by-neighborhood`    | Actividad por barrio (KPIs + mapa)       |

> El contrato completo de la API (campos, tipos y ejemplos de respuesta) está en [`API_CONTRACT.md`](./API_CONTRACT.md).

---

## Cómo correr el proyecto

### Requisitos previos

- Node.js ≥ 18
- Yarn
- El **backend de RedActiva** corriendo (ver su README)

### Pasos

**1. Clonar e instalar dependencias**
```bash
git clone <url-del-repo>
cd red-activa-webapp
yarn install
```

**2. Configurar variables de entorno**
```bash
cp .env.example .env
# Completar VITE_API_URL con la URL del backend
```

**3. Levantar en modo desarrollo**
```bash
yarn dev
```

La app queda disponible en `http://localhost:5173` (o el puerto que indique Vite).

---

## Variables de entorno

| Variable       | Ejemplo                      | Descripción              |
| -------------- | ---------------------------- | ------------------------ |
| `VITE_API_URL` | `http://localhost:3001/api`  | URL base del backend     |

> Vite solo expone al cliente las variables que empiezan con `VITE_`.

---

## Scripts disponibles

| Comando        | Descripción                    |
| -------------- | ------------------------------ |
| `yarn dev`     | Servidor de desarrollo (Vite)  |
| `yarn build`   | Build de producción            |
| `yarn preview` | Previsualización del build     |
| `yarn lint`    | Verificación de tipos con tsc  |
