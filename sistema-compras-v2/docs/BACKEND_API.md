
# Documentación Backend (Lógica de Negocio)

Este proyecto utiliza una arquitectura **Serverless**. No existe un servidor de Node.js tradicional (como Express) corriendo permanentemente. La lógica vive en **Supabase**.

## 1. API de Datos (Data Layer)
El frontend se comunica directamente con la base de datos a través de `supabase-js`.
*   **Endpoint**: `https://[PROJECT_REF].supabase.co/rest/v1/`
*   **Autenticación**: JWT Token (Bearer) enviado en cada petición.

## 2. Funciones de Base de Datos (PL/pgSQL)
La lógica crítica de integridad se maneja dentro de PostgreSQL.

### `generate_order_number`
*   **Propósito**: Garantizar secuencias únicas sin condiciones de carrera.
*   **Ubicación**: Esquema `public`.
*   **Detalles**:
    *   Usa `pg_advisory_xact_lock` para serializar inserciones simultáneas.
    *   Resetea la numeración cada año (YYYY).

## 3. Edge Functions (Deno/TypeScript)
*Nota: Si se implementaron funciones para envío de correos o WhatsApp, viven aquí.*

*   **`send-notification`** (Planificada):
    *   Escucha Webhooks de base de datos (`INSERT` en `orders`).
    *   Envía notificación a Logística.

## 4. Storage (Archivos)
*   **Bucket**: `quotes`
*   **Estructura**: `/{year}/{order_id}/{filename}`
*   **Políticas**:
    *   Public Read: Falso.
    *   Auth Read: Verdadero (Solo usuarios logueados).
