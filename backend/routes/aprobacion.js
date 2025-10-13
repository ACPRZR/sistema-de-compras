const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const TokenService = require('../services/tokenService');
const bcrypt = require('bcrypt');

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
      `SELECT * FROM ordenes_compra.orden_items WHERE orden_id = $1 ORDER BY id`,
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
  try {
    const { token } = req.params;
    const { nombre, observaciones } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log('📥 Aprobar - Token:', token);
    console.log('📥 Aprobar - Nombre:', nombre);
    
    // Validar token
    const orden = await TokenService.validateToken(token);
    
    console.log('🔍 Validación token resultado:', orden ? 'OK' : 'FALLÓ');
    
    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'TOKEN_INVALIDO',
        message: 'El link de aprobación no es válido'
      });
    }
    
    if (orden.error) {
      return res.status(400).json({
        success: false,
        error: orden.error,
        message: orden.message
      });
    }
    
    console.log('✅ Token válido, actualizando orden...');
    
    // Actualizar estado de la orden a "Aprobada" (ID: 3)
    await pool.query(
      `UPDATE ordenes_compra.ordenes_compra 
       SET estado_id = 3,
           aprobada_por = $1,
           aprobada_fecha = CURRENT_TIMESTAMP,
           aprobada_ip = $2
       WHERE id = $3`,
      [
        nombre || 'Anónimo',
        ip,
        orden.id
      ]
    );
    
    console.log('✅ Orden actualizada, marcando token como usado...');
    
    // Marcar token como usado
    await TokenService.markTokenAsUsed(token);
    
    console.log('✅ Token marcado como usado, enviando respuesta...');
    
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
    console.error('❌ Error aprobando orden:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al aprobar la orden'
    });
  }
});

/**
 * @route   POST /api/aprobacion/:token/rechazar
 * @desc    Rechazar una orden de compra
 * @access  Público (sin autenticación)
 */
router.post('/:token/rechazar', async (req, res) => {
  try {
    const { token } = req.params;
    const { nombre, motivo } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log('📥 Rechazar - Token:', token);
    console.log('📥 Rechazar - Nombre:', nombre);
    
    // Validar token
    const orden = await TokenService.validateToken(token);
    
    if (!orden) {
      return res.status(404).json({
        success: false,
        error: 'TOKEN_INVALIDO',
        message: 'El link de rechazo no es válido'
      });
    }
    
    if (orden.error) {
      return res.status(400).json({
        success: false,
        error: orden.error,
        message: orden.message
      });
    }
    
    console.log('✅ Token válido, rechazando orden...');
    
    // Actualizar estado de la orden a "Cancelada" (ID: 6)
    await pool.query(
      `UPDATE ordenes_compra.ordenes_compra 
       SET estado_id = 6,
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
    
    console.log('✅ Orden rechazada exitosamente');
    
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
    console.error('❌ Error rechazando orden:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al rechazar la orden'
    });
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
      `SELECT oc.*, e.codigo as estado_codigo
       FROM ordenes_compra.ordenes_compra oc
       LEFT JOIN ordenes_compra.estados_orden e ON oc.estado_id = e.id
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
    
    // Permitir generar tokens solo para órdenes "Creada" (1) o "En Revisión" (2)
    if (orden.estado_id !== 1 && orden.estado_id !== 2) {
      return res.status(400).json({
        success: false,
        error: 'ESTADO_INVALIDO',
        message: `No se puede generar token para órdenes en estado "${orden.estado_nombre}"`,
        data: {
          estado_actual: orden.estado_nombre,
          estado_id: orden.estado_id
        }
      });
    }
    
    // Verificar si hay un token activo (no expirado, no usado)
    if (orden.token_aprobacion && !orden.token_usado) {
      const tokenExpiraFecha = new Date(orden.token_expira_fecha);
      const ahora = new Date();
      
      if (tokenExpiraFecha > ahora) {
        // Token TODAVÍA VÁLIDO
        const minutosRestantes = Math.ceil((tokenExpiraFecha - ahora) / (1000 * 60));
        const horasRestantes = Math.floor(minutosRestantes / 60);
        const mins = minutosRestantes % 60;
        
        return res.status(400).json({
          success: false,
          error: 'TOKEN_ACTIVO',
          message: `Ya existe un link de aprobación válido que expira en ${horasRestantes}h ${mins}min`,
          data: {
            token_creado: orden.token_creado_fecha,
            token_expira: orden.token_expira_fecha,
            horas_restantes: horasRestantes,
            minutos_restantes: minutosRestantes
          }
        });
      }
    }
    
    // Token expirado, usado o no existe → GENERAR NUEVO
    const esRegeneracion = !!orden.token_aprobacion;
    const token = await TokenService.generateTokenForOrden(ordenId, 12); // 12 HORAS
    
    // Solo cambiar a "En Revisión" si está en "Creada"
    if (orden.estado_id === 1) {
      await pool.query(
        `UPDATE ordenes_compra.ordenes_compra 
         SET estado_id = 2 
         WHERE id = $1`,
        [ordenId]
      );
      console.log(`✅ Orden ${ordenId} cambiada a estado "En Revisión"`);
    } else {
      console.log(`ℹ️ Orden ${ordenId} - Token regenerado (ya estaba en "En Revisión")`);
    }
    
    // Generar URLs
    const urls = TokenService.generateUrls(
      token,
      baseUrl || `${req.protocol}://${req.get('host')}`
    );
    
    // Generar mensaje de WhatsApp
    const whatsappMessage = TokenService.generateWhatsAppMessage(orden, urls);
    
    res.json({
      success: true,
      message: esRegeneracion ? 'Token regenerado exitosamente' : 'Token generado exitosamente',
      data: {
        token,
        urls,
        whatsappMessage,
        expira_en_horas: 12,
        regenerado: esRegeneracion
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

/**
 * @route   GET /api/aprobacion/aprobadores/listar
 * @desc    Obtener lista de usuarios aprobadores
 * @access  Privado (requiere autenticación)
 */
router.get('/aprobadores/listar', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        nombre_completo,
        cargo,
        email,
        puede_aprobar_sin_limite
      FROM ordenes_compra.usuarios
      WHERE es_aprobador = true 
        AND activo = true
      ORDER BY 
        CASE cargo
          WHEN 'Presidente' THEN 1
          WHEN 'Secretaria' THEN 2
          ELSE 3
        END,
        nombre_completo
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo aprobadores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de aprobadores'
    });
  }
});

/**
 * @route   POST /api/aprobacion/validar-pin
 * @desc    Validar PIN del aprobador desde el token
 * @access  Público
 */
router.post('/validar-pin', async (req, res) => {
  try {
    const { token, pin } = req.body;
    
    if (!token || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Token y PIN son requeridos'
      });
    }
    
    // 1. Validar token
    const orden = await TokenService.validateToken(token);
    
    if (!orden || orden.error) {
      return res.status(400).json({
        success: false,
        error: orden?.error || 'TOKEN_INVALIDO',
        message: orden?.message || 'Token inválido'
      });
    }
    
    // 2. Obtener el aprobador asignado a esta orden
    const aprobadorResult = await pool.query(`
      SELECT u.id, u.nombre_completo, u.cargo, u.dni, u.pin_aprobacion
      FROM ordenes_compra.ordenes_compra oc
      INNER JOIN ordenes_compra.usuarios u ON oc.aprobador_id = u.id
      WHERE oc.id = $1 AND u.es_aprobador = true AND u.activo = true
    `, [orden.id]);
    
    if (aprobadorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'APROBADOR_NO_ENCONTRADO',
        message: 'Esta orden no tiene un aprobador asignado. Es una orden antigua creada antes del sistema de aprobación con PIN. Por favor, crea una nueva orden.'
      });
    }
    
    const aprobador = aprobadorResult.rows[0];
    
    // 3. Validar PIN
    const pinValido = await bcrypt.compare(pin, aprobador.pin_aprobacion);
    
    if (!pinValido) {
      return res.status(401).json({
        success: false,
        error: 'PIN_INVALIDO',
        message: 'PIN incorrecto'
      });
    }
    
    // 4. PIN válido - retornar datos del aprobador
    res.json({
      success: true,
      message: 'PIN validado exitosamente',
      data: {
        aprobador: {
          id: aprobador.id,
          nombre_completo: aprobador.nombre_completo,
          cargo: aprobador.cargo,
          dni: aprobador.dni
        },
        orden: {
          id: orden.id,
          numero_oc: orden.numero_oc
        }
      }
    });
    
  } catch (error) {
    console.error('Error validando PIN:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el PIN'
    });
  }
});

module.exports = router;

