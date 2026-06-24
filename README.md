# Red Activa — Web App

> Frontend de Red Activa: interfaz para el registro de personas no identificadas
> en instituciones y el reporte ciudadano de personas desaparecidas. Consume la
> API REST de [red-activa-backend](https://github.com/CoachEmilio/red-activa-backend).

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?logo=redux&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white)

---

## Índice

- [Descripción del proyecto](#descripción-del-proyecto)
- [Relación con el backend](#relación-con-el-backend)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Páginas y componentes](#páginas-y-componentes)
- [Conexión con la API](#conexión-con-la-api)
- [Cómo correr el proyecto](#cómo-correr-el-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)

---

## Descripción del proyecto

**Red Activa Web App** es la capa de presentación del sistema Red Activa. Permite
a las instituciones (hospitales, refugios, comisarías) registrar y consultar
personas no identificadas (**N.N.**), y a la ciudadanía reportar personas
desaparecidas. La aplicación consume la API del backend, que se encarga de
persistir los datos en MongoDB y de cruzar registros mediante un algoritmo de
similitud compuesta.

**Materia:** Ingeniería de Datos II — Datos No Relacionales
**Profesores:** Moises Evaristo Bueno — Federico Humberto Arenales
**Integrantes:** Braian Botrera, Romero Quirino Luis Emilio, Di Pasquasio Federico, Manuel Zárraga, Agustín Diaz

---

## Relación con el backend

Este repositorio es **únicamente el frontend**. No tiene base de datos propia ni
lógica de negocio: toda la persistencia y el matching viven en el backend.

Usuario (navegador)

└─> Red Activa Web App (React + Vite)

└─> fetch / hook useApi

└─> API REST red-activa-backend (http://localhost:3001/api)

└─> MongoDB

Para usar la app es necesario tener el **backend corriendo** (ver su README).

---

## Stack tecnológico

| Tecnología     | Rol                                      |
| -------------- | ---------------------------------------- |
| React          | Librería de UI                           |
| TypeScript     | Lenguaje                                 |
| Vite           | Build tool / dev server                  |
| Redux Toolkit  | Manejo de estado global (auth)           |
| React Router   | Ruteo entre páginas                      |

> Las versiones exactas de cada dependencia están en `package.json`.

---

## Estructura del proyecto

red-activa-webapp/

├── public/

│   └── favicon.svg

├── src/

│   ├── components/         # Componentes de UI

│   │   ├── AlertsDrawer.tsx

│   │   ├── Dashboard.tsx

│   │   ├── Footer.tsx

│   │   ├── Header.tsx

│   │   ├── HospitalAdmission.tsx

│   │   ├── LocationMap.tsx

│   │   ├── Login.tsx

│   │   ├── MissingPersonReport.tsx

│   │   ├── NNDetail.tsx

│   │   ├── OfficialPortal.tsx

│   │   └── PulseLoader.tsx

│   ├── hooks/

│   │   ├── useApi.ts          # Hook para consumir la API del backend

│   │   └── useAppDispatch.ts  # Dispatch tipado de Redux

│   ├── pages/

│   │   ├── NNAdmissionPage.tsx  # Alta de persona no identificada

│   │   ├── NNDetailPage.tsx     # Detalle de persona y similitudes

│   │   └── NNListPage.tsx       # Listado de personas no identificadas

│   ├── store/

│   │   ├── authSlice.ts       # Slice de autenticación (JWT)

│   │   └── index.ts           # Configuración del store de Redux

│   ├── utils/

│   ├── App.tsx                # Definición de rutas y layout

│   ├── main.tsx               # Entry point de React

│   ├── types.ts               # Tipos compartidos

│   └── index.css

├── .env.example

├── index.html

├── server.ts                 # [verificar] servidor auxiliar

├── vite.config.ts

├── tsconfig.json

└── package.json

---

## Páginas y componentes

| Elemento                | Rol                                                            |
| ----------------------- | -------------------------------------------------------------- |
| `Login`                 | Autenticación contra `/auth/login` (guarda el JWT en el store) |
| `OfficialPortal`        | Acceso al portal interno/institucional                         |
| `Dashboard`             | Tablero con indicadores (datos de `/analytics`)                |
| `HospitalAdmission`     | Carga de ingreso de persona no identificada                    |
| `NNAdmissionPage`       | Página de alta de N.N. (`POST /persons`)                       |
| `NNListPage`            | Listado de N.N. (`GET /persons`)                               |
| `NNDetailPage` / `NNDetail` | Detalle de N.N. y sus cruces (`GET /persons/:id`, `/similarities`) |
| `MissingPersonReport`   | Reporte ciudadano de persona desaparecida (modelo `Report`)    |
| `LocationMap`           | Mapa geográfico (datos de `/analytics/heatmap`)                |
| `AlertsDrawer`          | Panel lateral de alertas/notificaciones                        |
| `Header` / `Footer`     | Layout general                                                 |
| `PulseLoader`           | Indicador de carga                                             |

> N.N. = persona no identificada, según el modelo `Person` del backend.

---

## Conexión con la API

La app consume los endpoints del backend (base `http://localhost:3001/api`).
Los endpoints disponibles están documentados en el README del backend; los
principales que utiliza el frontend son:

- `POST /auth/login`
- `GET` / `POST` `/persons`, `GET /persons/:id`, `GET /persons/:id/similarities`
- `GET /reports`, `GET /reports/:id`
- `GET /analytics/summary`, `/analytics/by-neighborhood`, `/analytics/heatmap`

Las llamadas se centralizan en el hook `useApi`, que adjunta el token JWT en el
header `Authorization: Bearer <token>`.

---

## Cómo correr el proyecto

### Requisitos previos

- Node.js
- Yarn
- El **backend de Red Activa** corriendo (ver su README)

### Pasos

**1. Instalar dependencias**
```bash
yarn install
```

**2. Configurar variables de entorno**
```bash
cp .env.example .env
# Completar la URL del backend (ver sección Variables de entorno)
```

**3. Levantar en modo desarrollo**
```bash
yarn dev
```

La app queda disponible en la URL que indique Vite por consola (por defecto
`http://localhost:5173`).

---

## Variables de entorno

| Variable        | Ejemplo                       | Descripción                          |
| --------------- | ----------------------------- | ------------------------------------ |
| `VITE_API_URL`  | `http://localhost:3001/api`   | URL base del backend **[verificar nombre exacto en `.env.example`]** |

> Vite solo expone al cliente las variables que empiezan con `VITE_`.

---

## Scripts disponibles

| Comando        | Descripción                       |
| -------------- | --------------------------------- |
| `yarn dev`     | Servidor de desarrollo (Vite)     |
| `yarn build`   | Build de producción               |
| `yarn preview` | Previsualización del build        |

> Confirmar los scripts exactos en `package.json`.
