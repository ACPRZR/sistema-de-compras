const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * @route   GET /api/secuencias/siguiente-numero-oc
 * @desc    Obtener el siguiente número de orden de compra
 * @access  Privado (en producción debería requerir autenticación)
 */
router.get('/siguiente-numero-oc', async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Iniciar transacción para garantizar atomicidad
    await client.query('BEGIN');
    
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const periodo = `${anioActual}-${mesActual}`;
    
    // Obtener y actualizar el contador en una sola operación (FOR UPDATE asegura lock)
    const result = await client.query(`
      INSERT INTO ordenes_compra.secuencias (tipo, prefijo, periodo, contador, ultima_actualizacion)
      VALUES ('orden_compra', 'OC', $1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (tipo, periodo) 
      DO UPDATE SET 
        contador = ordenes_compra.secuencias.contador + 1,
        ultima_actualizacion = CURRENT_TIMESTAMP
      RETURNING 
        prefijo,
        periodo,
        contador,
        prefijo || '-' || periodo || '-' || LPAD(contador::TEXT, 3, '0') as numero_completo
    `, [periodo]);
    
    await client.query('COMMIT');
    
    const secuencia = result.rows[0];
    
    console.log(`✅ Número de OC generado: ${secuencia.numero_completo}`);
    
    res.json({
      success: true,
      data: {
        numero: secuencia.numero_completo,
        prefijo: secuencia.prefijo,
        periodo: secuencia.periodo,
        contador: secuencia.contador
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error generando número de OC:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al generar número de orden de compra'
    });
  } finally {
    client.release();
  }
});

/**
 * @route   GET /api/secuencias/preview-numero-oc
 * @desc    Ver el próximo número de OC SIN incrementar el contador
 * @access  Privado
 */
router.get('/preview-numero-oc', async (req, res) => {
  try {
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const periodo = `${anioActual}-${mesActual}`;
    
    const result = await pool.query(`
      SELECT 
        prefijo,
        periodo,
        contador,
        prefijo || '-' || periodo || '-' || LPAD((contador + 1)::TEXT, 3, '0') as proximo_numero
      FROM ordenes_compra.secuencias
      WHERE tipo = 'orden_compra' AND periodo = $1
    `, [periodo]);
    
    if (result.rows.length === 0) {
      // Si no existe secuencia para este período, el próximo será 001
      res.json({
        success: true,
        data: {
          numero: `OC-${anioActual}-${mesActual}-001`,
          prefijo: 'OC',
          periodo: periodo,
          contador: 0
        }
      });
    } else {
      const secuencia = result.rows[0];
      res.json({
        success: true,
        data: {
          numero: secuencia.proximo_numero,
          prefijo: secuencia.prefijo,
          periodo: secuencia.periodo,
          contador: secuencia.contador
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo preview de número OC:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al obtener preview del número'
    });
  }
});

/**
 * @route   POST /api/secuencias/reset-contador-oc
 * @desc    Resetear contador de OC (SOLO DESARROLLO/TESTING)
 * @access  Privado (debería requerir permisos de administrador)
 */
router.post('/reset-contador-oc', async (req, res) => {
  try {
    const { periodo } = req.body;
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const periodoReset = periodo || `${anioActual}-${mesActual}`;
    
    const result = await pool.query(`
      UPDATE ordenes_compra.secuencias
      SET contador = 0, ultima_actualizacion = CURRENT_TIMESTAMP
      WHERE tipo = 'orden_compra' AND periodo = $1
      RETURNING *
    `, [periodoReset]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No existe secuencia para el período ${periodoReset}`
      });
    }
    
    console.log(`⚠️ Contador de OC ${periodoReset} reseteado a 0`);
    
    const [anio, mes] = periodoReset.split('-');
    res.json({
      success: true,
      message: `Contador de OC ${periodoReset} reseteado exitosamente`,
      data: {
        proximo_numero: `OC-${anio}-${mes}-001`
      }
    });
    
  } catch (error) {
    console.error('❌ Error reseteando contador:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Error al resetear contador'
    });
  }
});

module.exports = router;

