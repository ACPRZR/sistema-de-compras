const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const TokenService = require('../services/tokenService');

/**
 * @route   GET /api/aprobacion/:token
 * @desc    Obtener detalles de la orden para aprobar/rechazar
 * @access  Público (sin autenticación)
 */
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Validar token
    const orden = await TokenService.validateToken(token);
    
    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'TOKEN_INVALIDO',
        message: 'El link de aprobación no es válido'
      });
    }
    
    // Si hay error en la validación (token usado, expirado, etc.)
    if (orden.error) {
      return res.status(400).json({
        success: false,
        error: orden.error,
        message: orden.message,
        orden: {
          numero_oc: orden.numero_oc,
          estado: orden.estado_nombre
        }
      });
    }
    
    // Obtener items de la orden
    const itemsResult = await pool.query(
      `SELECT * FROM orden_items WHERE orden_id = $1 ORDER BY id`,
      [orden.id]
    );
    
    // Preparar respuesta
    res.json({
      success: true,
      data: {
        orden: {
          id: orden.id,
          numero_oc: orden.numero_oc,
          fecha_creacion: orden.fecha_creacion,
          fecha_requerimiento: orden.fecha_requerimiento,
          categoria: orden.categoria_nombre,
          estado: orden.estado_nombre,
          proveedor: {
            nombre: orden.proveedor_nombre || orden.proveedor_nombre,
            ruc: orden.proveedor_ruc,
            contacto: orden.proveedor_contacto,
            telefono: orden.proveedor_telefono,
            email: orden.proveedor_email
          },
          ubicacion_entrega: orden.lugar_entrega,
          datos_proyecto: orden.datos_proyecto,
          total: parseFloat(orden.total || 0),
          items: itemsResult.rows
        }
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al obtener los detalles de la orden'
    });
  }
});

/**
 * @route   POST /api/aprobacion/:token/aprobar
 * @desc    Aprobar una orden de compra
 * @access  Público (sin autenticación)
 */
router.post('/:token/aprobar', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { token } = req.params;
    const { nombre, observaciones } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Validar token
    const orden = await TokenService.validateToken(token);
    
    if (!orden) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'TOKEN_INVALIDO',
        message: 'El link de aprobación no es válido'
      });
    }
    
    if (orden.error) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: orden.error,
        message: orden.message
      });
    }
    
    // Actualizar estado de la orden a "Aprobada" (ID: 2)
    await client.query(
      `UPDATE ordenes_compra 
       SET estado_id = 2,
           aprobada_por = $1,
           aprobada_fecha = CURRENT_TIMESTAMP,
           aprobada_ip = $2,
           observaciones = COALESCE(observaciones, '') || $3
       WHERE id = $4`,
      [
        nombre || 'Anónimo',
        ip,
        observaciones ? `\nAprobación: ${observaciones}` : '',
        orden.id
      ]
    );
    
    // Marcar token como usado
    await TokenService.markTokenAsUsed(token);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Orden aprobada exitosamente',
      data: {
        orden_id: orden.id,
        numero_oc: orden.numero_oc,
        aprobada_por: nombre || 'Anónimo',
        aprobada_fecha: new Date()
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error aprobando orden:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al aprobar la orden'
    });
  } finally {
    client.release();
  }
});

/**
 * @route   POST /api/aprobacion/:token/rechazar
 * @desc    Rechazar una orden de compra
 * @access  Público (sin autenticación)
 */
router.post('/:token/rechazar', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { token } = req.params;
    const { nombre, motivo } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Validar token
    const orden = await TokenService.validateToken(token);
    
    if (!orden) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'TOKEN_INVALIDO',
        message: 'El link de rechazo no es válido'
      });
    }
    
    if (orden.error) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: orden.error,
        message: orden.message
      });
    }
    
    // Actualizar estado de la orden a "Cancelada" (ID: 5)
    await client.query(
      `UPDATE ordenes_compra 
       SET estado_id = 5,
           rechazada_por = $1,
           rechazada_fecha = CURRENT_TIMESTAMP,
           rechazada_motivo = $2,
           rechazada_ip = $3
       WHERE id = $4`,
      [
        nombre || 'Anónimo',
        motivo || 'Sin motivo especificado',
        ip,
        orden.id
      ]
    );
    
    // Marcar token como usado
    await TokenService.markTokenAsUsed(token);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Orden rechazada',
      data: {
        orden_id: orden.id,
        numero_oc: orden.numero_oc,
        rechazada_por: nombre || 'Anónimo',
        rechazada_fecha: new Date(),
        motivo: motivo || 'Sin motivo especificado'
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error rechazando orden:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al rechazar la orden'
    });
  } finally {
    client.release();
  }
});

/**
 * @route   POST /api/aprobacion/generar-token/:ordenId
 * @desc    Generar token de aprobación para una orden
 * @access  Privado (requiere autenticación - TODO)
 */
router.post('/generar-token/:ordenId', async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { baseUrl } = req.body;
    
    // Verificar que la orden existe y está en estado "Creada"
    const ordenResult = await pool.query(
      `SELECT oc.*, e.codigo as estado_codigo, p.nombre as proveedor_nombre
       FROM ordenes_compra oc
       LEFT JOIN estados_orden e ON oc.estado_id = e.id
       LEFT JOIN proveedores p ON oc.proveedor_id = p.id
       WHERE oc.id = $1`,
      [ordenId]
    );
    
    if (ordenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'ORDEN_NO_ENCONTRADA',
        message: 'La orden no existe'
      });
    }
    
    const orden = ordenResult.rows[0];
    
    if (orden.estado_id !== 1) {
      return res.status(400).json({
        success: false,
        error: 'ESTADO_INVALIDO',
        message: 'Solo se pueden generar tokens para órdenes en estado "Creada"'
      });
    }
    
    // Generar nuevo token
    const token = await TokenService.generateTokenForOrden(ordenId);
    
    // Generar URLs
    const urls = TokenService.generateUrls(
      token,
      baseUrl || `${req.protocol}://${req.get('host')}`
    );
    
    // Generar mensaje de WhatsApp
    const whatsappMessage = TokenService.generateWhatsAppMessage(orden, urls);
    
    res.json({
      success: true,
      message: 'Token generado exitosamente',
      data: {
        token,
        urls,
        whatsappMessage,
        expira_en_horas: 48
      }
    });
    
  } catch (error) {
    console.error('Error generando token:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al generar el token de aprobación'
    });
  }
});

module.exports = router;

