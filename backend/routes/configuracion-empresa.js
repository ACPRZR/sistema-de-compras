const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/configuracion-empresa - Obtener configuración de la empresa
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM ordenes_compra.configuracion_empresa 
      WHERE activa = true
      LIMIT 1
    `);

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error obteniendo configuración de empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de empresa',
      error: error.message
    });
  }
});

module.exports = router;

