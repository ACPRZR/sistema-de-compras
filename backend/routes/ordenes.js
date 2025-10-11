const express = require('express');
const { body, validationResult } = require('express-validator');
const OrdenCompra = require('../models/OrdenCompra');
const OrdenItem = require('../models/OrdenItem');
const router = express.Router();

// Middleware para validar errores
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones
const validarOrden = [
  body('fecha_requerimiento').isISO8601().withMessage('Fecha de requerimiento inválida'),
  body('categoria_id').isInt({ min: 1 }).withMessage('Categoría es requerida'),
  body('tipo_oc_id').isInt({ min: 1 }).withMessage('Tipo de orden es requerido'),
  body('estado_id').isInt({ min: 1 }).withMessage('Estado es requerido'),
  body('prioridad_id').isInt({ min: 1 }).withMessage('Prioridad es requerida'),
  body('unidad_negocio_id').isInt({ min: 1 }).withMessage('Unidad de negocio es requerida'),
  body('unidad_autoriza_id').isInt({ min: 1 }).withMessage('Unidad autorizadora es requerida'),
  body('ubicacion_entrega_id').isInt({ min: 1 }).withMessage('Ubicación de entrega es requerida'),
  body('lugar_entrega').notEmpty().withMessage('Lugar de entrega es requerido'),
  body('datos_proyecto').notEmpty().withMessage('Datos del proyecto son requeridos'),
  body('proveedor_nombre').notEmpty().withMessage('Nombre del proveedor es requerido'),
  body('proveedor_ruc').isLength({ min: 11, max: 11 }).withMessage('RUC debe tener 11 dígitos'),
  body('condiciones_pago_id').isInt({ min: 1 }).withMessage('Condiciones de pago son requeridas'),
  body('comprador_responsable_id').isInt({ min: 1 }).withMessage('Comprador responsable es requerido'),
  body('total').isFloat({ min: 0 }).withMessage('Total debe ser mayor o igual a 0')
];

const validarItem = [
  body('descripcion').notEmpty().withMessage('Descripción es requerida'),
  body('unidad_id').isInt({ min: 1 }).withMessage('Unidad es requerida'),
  body('cantidad').isFloat({ min: 0.01 }).withMessage('Cantidad debe ser mayor a 0'),
  body('precio_unitario').isFloat({ min: 0 }).withMessage('Precio unitario debe ser mayor o igual a 0')
];

// GET /api/ordenes - Obtener todas las órdenes
router.get('/', async (req, res) => {
  try {
    const {
      estado_id,
      categoria_id,
      proveedor_id,
      fecha_desde,
      fecha_hasta,
      busqueda,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {
      estado_id: estado_id ? parseInt(estado_id) : undefined,
      categoria_id: categoria_id ? parseInt(categoria_id) : undefined,
      proveedor_id: proveedor_id ? parseInt(proveedor_id) : undefined,
      fecha_desde,
      fecha_hasta,
      busqueda,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const ordenes = await OrdenCompra.findAll(filters);
    
    res.json({
      success: true,
      data: ordenes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: ordenes.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/ordenes/stats - Obtener estadísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await OrdenCompra.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/ordenes/generate-number - Generar número de orden
router.get('/generate-number', async (req, res) => {
  try {
    const numeroOC = await OrdenCompra.generateOCNumber();
    
    res.json({
      success: true,
      data: { numero_oc: numeroOC }
    });
  } catch (error) {
    console.error('Error generando número de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/ordenes/:id - Obtener orden por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orden = await OrdenCompra.findById(id);
    
    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Obtener items de la orden
    const items = await OrdenItem.findByOrdenId(id);
    orden.items = items;
    
    res.json({
      success: true,
      data: orden
    });
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/ordenes - Crear nueva orden
router.post('/', validarOrden, handleValidationErrors, async (req, res) => {
  try {
    const ordenData = {
      ...req.body,
      created_by: req.user?.id || 1 // TODO: Obtener del token JWT
    };

    const orden = await OrdenCompra.create(ordenData);
    
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: orden
    });
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/ordenes/:id - Actualizar orden
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_by: req.user?.id || 1 // TODO: Obtener del token JWT
    };

    const orden = await OrdenCompra.update(id, updateData);
    
    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Orden actualizada exitosamente',
      data: orden
    });
  } catch (error) {
    console.error('Error actualizando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/ordenes/:id - Eliminar orden
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orden = await OrdenCompra.delete(id);
    
    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Orden eliminada exitosamente',
      data: orden
    });
  } catch (error) {
    console.error('Error eliminando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// =====================================================
// RUTAS PARA ITEMS DE ÓRDENES
// =====================================================

// GET /api/ordenes/:id/items - Obtener items de una orden
router.get('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const items = await OrdenItem.findByOrdenId(id);
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error obteniendo items:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/ordenes/:id/items - Agregar item a una orden
router.post('/:id/items', validarItem, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const itemData = {
      ...req.body,
      orden_id: parseInt(id),
      subtotal: req.body.cantidad * req.body.precio_unitario
    };

    // Obtener siguiente número de item
    itemData.item_numero = await OrdenItem.getNextItemNumber(id);

    const item = await OrdenItem.create(itemData);
    
    // Recalcular total de la orden
    const total = await OrdenItem.calculateTotal(id);
    await OrdenCompra.update(id, { total });

    res.status(201).json({
      success: true,
      message: 'Item agregado exitosamente',
      data: item
    });
  } catch (error) {
    console.error('Error agregando item:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/ordenes/:id/items/bulk - Agregar múltiples items
router.post('/:id/items/bulk', async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de items'
      });
    }

    // Preparar items con datos calculados
    const itemsData = items.map((item, index) => ({
      ...item,
      orden_id: parseInt(id),
      item_numero: index + 1,
      subtotal: item.cantidad * item.precio_unitario
    }));

    const itemsCreados = await OrdenItem.createMultiple(itemsData);
    
    // Recalcular total de la orden
    const total = await OrdenItem.calculateTotal(id);
    await OrdenCompra.update(id, { total });

    res.status(201).json({
      success: true,
      message: 'Items agregados exitosamente',
      data: itemsCreados
    });
  } catch (error) {
    console.error('Error agregando items:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/ordenes/:id/items/:itemId - Actualizar item
router.put('/:id/items/:itemId', validarItem, handleValidationErrors, async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = {
      ...req.body,
      subtotal: req.body.cantidad * req.body.precio_unitario
    };

    const item = await OrdenItem.update(itemId, updateData);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }

    // Recalcular total de la orden
    const { id } = req.params;
    const total = await OrdenItem.calculateTotal(id);
    await OrdenCompra.update(id, { total });

    res.json({
      success: true,
      message: 'Item actualizado exitosamente',
      data: item
    });
  } catch (error) {
    console.error('Error actualizando item:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/ordenes/:id/items/:itemId - Eliminar item
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await OrdenItem.delete(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado'
      });
    }

    // Recalcular total de la orden
    const { id } = req.params;
    const total = await OrdenItem.calculateTotal(id);
    await OrdenCompra.update(id, { total });

    res.json({
      success: true,
      message: 'Item eliminado exitosamente',
      data: item
    });
  } catch (error) {
    console.error('Error eliminando item:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/ordenes/:id/completar - Marcar orden como completada
router.put('/:id/completar', async (req, res) => {
  try {
    const { id } = req.params;
    const { completada_por } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Verificar que la orden existe y está en estado "Aprobada"
    const orden = await OrdenCompra.findById(id);
    
    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    if (orden.estado_id !== 2) { // 2 = Aprobada
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden completar órdenes aprobadas',
        estado_actual: orden.estado_nombre
      });
    }

    // Actualizar a estado "Completada" (ID: 4)
    const pool = require('../config/database').pool;
    await pool.query(
      `UPDATE ordenes_compra 
       SET estado_id = 4,
           completada_por = $1,
           completada_fecha = CURRENT_TIMESTAMP,
           completada_ip = $2
       WHERE id = $3`,
      [completada_por || 'Usuario', ip, id]
    );

    // Obtener orden actualizada
    const ordenActualizada = await OrdenCompra.findById(id);

    res.json({
      success: true,
      message: 'Orden marcada como completada',
      data: ordenActualizada
    });
  } catch (error) {
    console.error('Error completando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
