# 📊 Sistema de Estados de Órdenes de Compra

## 🔄 Flujo de Estados

```
┌─────────────┐
│   CREADA    │ Estado inicial al crear la orden
│   (ID: 1)   │
└──────┬──────┘
       │
       │ ✨ Automático al generar link WhatsApp
       ▼
┌─────────────┐
│ EN REVISIÓN │ Link de WhatsApp generado
│   (ID: 2)   │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       │ ✅ Aprobar vía link                 │ ❌ Rechazar vía link
       ▼                                     ▼
┌─────────────┐                      ┌─────────────┐
│  APROBADA   │                      │  CANCELADA  │
│   (ID: 3)   │                      │   (ID: 6)   │
└──────┬──────┘                      └─────────────┘
       │                                     
       │ 👤 Manual (botón "Completar")
       ▼
┌─────────────┐
│ COMPLETADA  │ Estado final
│   (ID: 5)   │
└─────────────┘
```

## 📝 Estados en la Base de Datos

| ID | Código | Nombre | Descripción | Cambio |
|----|--------|--------|-------------|---------|
| 1 | `creada` | **Creada** | Orden creada, aún no enviada para aprobación | Al crear orden |
| 2 | `revision` | **En Revisión** | Orden enviada para aprobación vía WhatsApp | Automático al generar link |
| 3 | `aprobada` | **Aprobada** | Orden aprobada por el autorizador | Automático al aprobar |
| 5 | `completada` | **Completada** | Orden completada exitosamente | Manual desde interfaz |
| 6 | `cancelada` | **Cancelada** | Orden rechazada/cancelada | Automático al rechazar |

## 🎨 Colores en la Interfaz

```javascript
// Configuración de colores por estado
const getEstadoColor = (estado) => {
  switch (estado) {
    case 'creada':      return 'bg-blue-100 text-blue-800';      // 🔵 Azul
    case 'revision':    return 'bg-warning-100 text-warning-800'; // 🟡 Amarillo
    case 'aprobada':    return 'bg-success-100 text-success-800'; // 🟢 Verde
    case 'completada':  return 'bg-green-100 text-green-800';     // ✅ Verde oscuro
    case 'cancelada':   return 'bg-danger-100 text-danger-800';   // 🔴 Rojo
  }
};
```

## 🔧 Cambios Implementados

### Backend

#### 1. `backend/routes/aprobacion.js`
- **Línea 280-288**: Al generar token, cambiar estado a "En Revisión" (ID: 2)
  ```javascript
  await pool.query(
    `UPDATE ordenes_compra.ordenes_compra 
     SET estado_id = 2 
     WHERE id = $1`,
    [ordenId]
  );
  ```

- **Línea 118-131**: Al aprobar, cambiar estado a "Aprobada" (ID: 3)
  ```javascript
  await pool.query(
    `UPDATE ordenes_compra.ordenes_compra 
     SET estado_id = 3,
         aprobada_por = $1,
         aprobada_fecha = CURRENT_TIMESTAMP,
         aprobada_ip = $2
     WHERE id = $3`,
    [nombre, ip, orden.id]
  );
  ```

- **Línea 196-211**: Al rechazar, cambiar estado a "Cancelada" (ID: 6)
  ```javascript
  await pool.query(
    `UPDATE ordenes_compra.ordenes_compra 
     SET estado_id = 6,
         rechazada_por = $1,
         rechazada_fecha = CURRENT_TIMESTAMP,
         rechazada_motivo = $2,
         rechazada_ip = $3
     WHERE id = $4`,
    [nombre, motivo, ip, orden.id]
  );
  ```

#### 2. `backend/routes/ordenes.js`
- **Línea 440-458**: Endpoint `/completar` verifica estado 3 (Aprobada) y actualiza a estado 5 (Completada)
  ```javascript
  if (orden.estado_id !== 3) { // 3 = Aprobada
    return res.status(400).json({
      success: false,
      message: 'Solo se pueden completar órdenes aprobadas'
    });
  }
  
  await pool.query(
    `UPDATE ordenes_compra.ordenes_compra 
     SET estado_id = 5, ...
     WHERE id = $3`,
    [completada_por, ip, id]
  );
  ```

### Frontend

#### 3. `src/components/Pages/OrdenesPendientes.jsx`
- **Línea 129-203**: Panel de estadísticas con 6 tarjetas:
  - Creadas (ID: 1) - Azul
  - En Revisión (ID: 2) - Amarillo
  - Aprobadas (ID: 3) - Verde
  - Completadas (ID: 5) - Verde oscuro
  - Canceladas (ID: 6) - Rojo
  - Monto Total - Primario

- **Línea 225-240**: Filtro por estado en la sección de filtros
  ```jsx
  <select>
    <option value="">Todos los estados</option>
    <option value="1">Creada</option>
    <option value="2">En Revisión</option>
    <option value="3">Aprobada</option>
    <option value="5">Completada</option>
    <option value="6">Cancelada</option>
  </select>
  ```

- **Línea 388-399**: Botón "Completar" solo visible para órdenes con estado_id = 3 (Aprobada)
  ```jsx
  {ordenSeleccionada.estado_id === 3 && (
    <Button onClick={() => handleCompletarOrden(ordenSeleccionada)}>
      Marcar como Completada
    </Button>
  )}
  ```

- **Línea 402-435**: Botones de acción con validaciones:
  - **Aprobar**: Solo habilitado para estado 1 (Creada) o 2 (En Revisión)
  - **Rechazar**: Deshabilitado para estado 5 (Completada) o 6 (Cancelada)
  - **Eliminar**: Deshabilitado para estado 5 (Completada)

#### 4. `src/hooks/useOrdenesPendientes.js`
- Ya tenía los estados correctamente configurados:
  - `getEstadoColor()` - Colores por estado
  - `getEstadoLabel()` - Etiquetas en español
  - Estadísticas incluyen todos los estados

## ✅ Validaciones de Negocio

### Transiciones Permitidas

| Estado Actual | Puede pasar a | Cómo |
|---------------|---------------|------|
| Creada (1) | En Revisión (2) | Automático al generar link |
| En Revisión (2) | Aprobada (3) o Cancelada (6) | Automático vía link |
| Aprobada (3) | Completada (5) | Manual desde interfaz |
| Completada (5) | - | Estado final |
| Cancelada (6) | - | Estado final |

### Reglas de Botones

- **Botón "Completar"**: Solo visible para órdenes Aprobadas (ID: 3)
- **Botón "Aprobar"**: Solo habilitado para órdenes Creadas o En Revisión (ID: 1 o 2)
- **Botón "Rechazar"**: Deshabilitado para órdenes Completadas o Canceladas (ID: 5 o 6)
- **Botón "Eliminar"**: Deshabilitado para órdenes Completadas (ID: 5)

## 🧪 Pruebas Sugeridas

1. **Crear Orden**
   - ✓ Estado inicial: "Creada" (ID: 1)
   - ✓ Aparece en estadísticas "Creadas"

2. **Generar Link WhatsApp**
   - ✓ Estado cambia automáticamente a "En Revisión" (ID: 2)
   - ✓ Aparece en estadísticas "En Revisión"

3. **Aprobar vía Link**
   - ✓ Estado cambia a "Aprobada" (ID: 3)
   - ✓ Aparece en estadísticas "Aprobadas"
   - ✓ Botón "Completar" ahora visible

4. **Completar Orden**
   - ✓ Estado cambia a "Completada" (ID: 5)
   - ✓ Aparece en estadísticas "Completadas"
   - ✓ Botones de acción deshabilitados

5. **Rechazar vía Link**
   - ✓ Estado cambia a "Cancelada" (ID: 6)
   - ✓ Aparece en estadísticas "Canceladas"

## 📊 Consultas SQL Útiles

```sql
-- Ver todos los estados configurados
SELECT id, codigo, nombre, descripcion 
FROM ordenes_compra.estados_orden 
ORDER BY id;

-- Ver órdenes por estado
SELECT 
  e.nombre as estado,
  COUNT(*) as cantidad,
  SUM(oc.total) as monto_total
FROM ordenes_compra.ordenes_compra oc
LEFT JOIN ordenes_compra.estados_orden e ON oc.estado_id = e.id
GROUP BY e.nombre
ORDER BY e.id;

-- Ver historial de cambios de estado de una orden
SELECT 
  numero_oc,
  estado_nombre,
  fecha_creacion,
  aprobada_fecha,
  completada_fecha,
  rechazada_fecha
FROM ordenes_compra.ordenes_compra
WHERE numero_oc = 'OC-2025-0001';
```

## 🎯 Funcionalidades Completas

✅ Cambio automático a "En Revisión" al generar link  
✅ Cambio automático a "Aprobada" al aprobar  
✅ Cambio automático a "Cancelada" al rechazar  
✅ Cambio manual a "Completada" desde interfaz  
✅ Panel de estadísticas con todos los estados  
✅ Filtro por estado en Órdenes Pendientes  
✅ Validación de botones según estado  
✅ Colores distintivos por estado  
✅ Etiquetas en español  

---

**Última actualización**: 12 de Octubre, 2025  
**Versión**: 1.0.0

