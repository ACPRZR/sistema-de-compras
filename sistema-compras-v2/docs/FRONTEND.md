
# Documentación Frontend (React)

## Estructura de Directorios (`src/`)

| Directorio | Propósito |
| :--- | :--- |
| `components/` | Componentes reutilizables de UI (Botones, Inputs, Modales). |
| `hooks/` | Lógica encapsulada (`useAuth`). |
| `layouts/` | Plantillas de página (`MainLayout.tsx` con Sidebar). |
| `pages/` | Vistas principales (Rutas). |
| `services/` | Configuración de clientes externos (`supabase.ts`). |
| `types/` | Definiciones de TypeScript (`Order`, `Profile`). |
| `utils/` | Funciones puras (`calculations.ts`, formateros). |

## Componentes Clave

### 1. `Dashboard.tsx`
*   **Ruta**: `/`
*   **Responsabilidad**: Mostrar KPIs y lista de últimas órdenes.
*   **Tecnología**: Usa Realtime Subscriptions para actualizarse en vivo cuando cambia una orden.

### 2. `CreateOrder.tsx`
*   **Ruta**: `/ordenes/nueva`
*   **Responsabilidad**: Formulario complejo para crear órdenes de Compra o Servicio.
*   **Características**:
    *   Cálculos automáticos de subtotales (vía `utils/calculations.ts`).
    *   Validación con `react-hook-form`.
    *   Manejo de array de ítems dinámico.

### 3. `AuthContext` (`useAuth.tsx`)
*   **Responsabilidad**: Mantener el estado de la sesión del usuario globalmente.
*   **Funcionamiento**: Escucha cambios en `supabase.auth.onAuthStateChange` y provee el objeto `user` y `session` a toda la app.

## Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Ejecutar pruebas (Unit + Integration)
npm test

# Construir para producción
npm run build
```

## Estilos
Se utiliza **Tailwind CSS**.
*   Los colores principales son `sky` (Primary) y `slate` (Neutral).
*   Se evitan estilos en línea (`style={{}}`) en favor de clases de utilidad.
