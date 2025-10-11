const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/ubicaciones-entrega - Obtener todas las ubicaciones de entrega activas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, codigo, nombre, direccion, activa
      FROM ordenes_compra.ubicaciones_entrega 
      WHERE activa = true
      ORDER BY nombre
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo ubicaciones de entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ubicaciones de entrega',
      error: error.message
    });
  }
});

module.exports = router;

