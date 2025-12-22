
# Documentación de Base de Datos

El sistema utiliza **PostgreSQL** alojado en Supabase.

## Esquema de Tablas (Schema Public)

### 1. `orders` (Órdenes de Compra/Servicio)
Tabla principal de transacciones.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | uuid | Identificador único (PK). |
| `order_number` | text | Correlativo generado (e.g. `OC-2025-001`). **Unique**. |
| `order_type` | text | `purchase` (Compra) o `service` (Servicio). |
| `status` | text | `created`, `pending_approval`, `approved`, `rejected`. |
| `user_id` | uuid | FK a `auth.users`. Creador de la orden. |
| `items` | jsonb | Lista de ítems o servicios (JSON array). |
| `files` | jsonb | (Legacy) Referencias a archivos. Ver `order_attachments`. |
| `whatsapp_token` | text | Token para aprobación externa. |
| `created_at` | timestamptz | Fecha de creación. |

### 2. `profiles` (Perfiles de Usuario)
Extiende la información de `auth.users`.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | uuid | FK a `auth.users`. (PK). |
| `role` | text | `admin`, `logistica`, `user`. Define permisos. |
| `full_name` | text | Nombre completo para mostrar. |
| `email` | text | Copia del email para búsquedas fáciles. |

### 3. `suppliers` (Proveedores)
Catálogo de proveedores. Sólo editable por Logística/Admin.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | int8 | Identificador numérico. |
| `name` | text | Razón Social. |
| `ruc` | text | Identificador Fiscal. |
| `contact_*` | text | Datos de contacto. |

## Políticas de Seguridad (RLS)

La seguridad se aplica a nivel de fila (Row Level Security).

### Tabla `orders`
*   **SELECT**:
    *   `admin`: Puede ver TODAS las filas.
    *   `user` (Dueño): Puede ver SOLO sus propias filas (`auth.uid() == user_id`).
*   **INSERT**:
    *   Cualquier usuario autenticado puede insertar.
*   **UPDATE**:
    *   `admin`: Puede cambiar estado a `approved`/`rejected`.
    *   `user` (Dueño): Puede editar borradores (`created`).

### Tabla `suppliers`
*   **SELECT**: Público para usuarios autenticados.
*   **INSERT/UPDATE/DELETE**: Restringido a rol `logistica` o `admin`.

## Triggers y Funciones

*   **`generate_order_number()`**:
    *   **Trigger**: `BEFORE INSERT ON orders`.
    *   **Lógica**:
        1.  Bloquea concurrencia (`pg_advisory_xact_lock`).
        2.  Calcula prefijo (`OS` o `OC`).
        3.  Busca el último número del AÑO actual.
        4.  Incrementa +1 y formatea.
