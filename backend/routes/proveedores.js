const express = require('express');
const { body, validationResult } = require('express-validator');
const Proveedor = require('../models/Proveedor');
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
const validarProveedor = [
  body('ruc')
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (value && value.length !== 11) {
        throw new Error('RUC debe tener 11 dígitos');
      }
      return true;
    }),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email inválido'),
  body('telefono').optional({ values: 'falsy' }).isLength({ min: 7, max: 20 }).withMessage('Teléfono inválido'),
  body('categoria_id').isInt({ min: 1 }).withMessage('Categoría es requerida'),
  body('calificacion').optional({ values: 'falsy' }).isFloat({ min: 0, max: 5 }).withMessage('Calificación debe estar entre 0 y 5')
];

// GET /api/proveedores - Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const {
      categoria_id,
      busqueda,
      page = 1,
      limit = 10
    } = req.query;

    const filters = {
      categoria_id: categoria_id ? parseInt(categoria_id) : undefined,
      busqueda,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const proveedores = await Proveedor.findAll(filters);
    
    res.json({
      success: true,
      data: proveedores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: proveedores.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/proveedores/stats - Obtener estadísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await Proveedor.getStats();
    
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

// GET /api/proveedores/search - Buscar proveedores
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Término de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const proveedores = await Proveedor.search(q);
    
    res.json({
      success: true,
      data: proveedores
    });
  } catch (error) {
    console.error('Error buscando proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/proveedores/categoria/:categoriaId - Obtener proveedores por categoría
router.get('/categoria/:categoriaId', async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const proveedores = await Proveedor.findByCategoria(categoriaId);
    
    res.json({
      success: true,
      data: proveedores
    });
  } catch (error) {
    console.error('Error obteniendo proveedores por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/proveedores/:id - Obtener proveedor por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findById(id);
    
    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: proveedor
    });
  } catch (error) {
    console.error('Error obteniendo proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/proveedores/ruc/:ruc - Obtener proveedor por RUC
router.get('/ruc/:ruc', async (req, res) => {
  try {
    const { ruc } = req.params;
    const proveedor = await Proveedor.findByRUC(ruc);
    
    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: proveedor
    });
  } catch (error) {
    console.error('Error obteniendo proveedor por RUC:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/proveedores - Crear nuevo proveedor
router.post('/', validarProveedor, handleValidationErrors, async (req, res) => {
  try {
    // Verificar si el RUC ya existe (solo si se proporcionó un RUC)
    if (req.body.ruc) {
      const proveedorExistente = await Proveedor.findByRUC(req.body.ruc);
      if (proveedorExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un proveedor con este RUC'
        });
      }
    }

    const proveedor = await Proveedor.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: proveedor
    });
  } catch (error) {
    console.error('Error creando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// PUT /api/proveedores/:id - Actualizar proveedor
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Si se está actualizando el RUC, verificar que no exista
    if (req.body.ruc) {
      const proveedorExistente = await Proveedor.findByRUC(req.body.ruc);
      if (proveedorExistente && proveedorExistente.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un proveedor con este RUC'
        });
      }
    }

    const proveedor = await Proveedor.update(id, req.body);
    
    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: proveedor
    });
  } catch (error) {
    console.error('Error actualizando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// DELETE /api/proveedores/:id - Eliminar proveedor (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.delete(id);
    
    if (!proveedor) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente',
      data: proveedor
    });
  } catch (error) {
    console.error('Error eliminando proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
