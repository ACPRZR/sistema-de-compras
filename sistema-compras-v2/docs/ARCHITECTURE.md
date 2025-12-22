
# Arquitectura del Sistema de Compras (v2.0)

## Visión General
El **Sistema de Compras** es una aplicación web moderna diseñada para gestionar la requisición, aprobación y seguimiento de Órdenes de Compra y Servicios para la empresa.

### Stack Tecnológico
| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | SPA (Single Page Application) rápida y reactiva. |
| **Estilos** | Tailwind CSS v4 | Diseño utility-first, responsivo y mantenible. |
| **Estado** | TanStack Query | Gestión de estado asíncrono (cache, re-fetching). |
| **Backend** | Supabase | BaaS (Backend as a Service). Provee Auth, DB y Storage. |
| **Base de Datos** | PostgreSQL 17 | Base de datos relacional robusta. |

## Diagrama de Flujo de Datos

```mermaid
graph TD
    User[Usuario] -->|HTTPS| Frontend[React App (Vite)]
    Frontend -->|Supabase SDK| Auth[Supabase Auth]
    Frontend -->|Supabase SDK| DB[(PostgreSQL)]
    Frontend -->|Supabase SDK| Storage[File Storage]
    
    subgraph "Nube (Supabase)"
        Auth
        DB
        Storage
        Trigger[DB Trigger: Auto-Number]
    end

    DB -->|Realtime| Frontend
    Trigger -->|Insert| DB
```

## Componentes Principales

1.  **Autenticación (Auth)**
    *   Gestionada por Supabase Auth.
    *   Soporta roles: `admin`, `logistica`, `requisitor` (gestionados en tabla `public.profiles`).

2.  **Gestión de Órdenes**
    *   **Creación**: Usuarios crean órdenes (`orders`).
    *   **Numeración**: Automática vía Trigger en DB (`OC-2025-001`).
    *   **Aprobación**: Flujo de estados (`created` -> `pending_approval` -> `approved`).

3.  **Seguridad (Row Level Security)**
    *   Todo acceso a datos está protegido por políticas RLS en la base de datos.
    *   El frontend NO puede "saltarse" estas reglas.

4.  **Despliegue**
    *   **Frontend**: Alojado en Vercel/Netlify.
    *   **Backend**: Instancia gestionada en Supabase Cloud.
