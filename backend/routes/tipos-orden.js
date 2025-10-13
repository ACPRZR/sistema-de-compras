const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/tipos-orden - Obtener todos los tipos de orden activos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, codigo, nombre, descripcion, activa
      FROM ordenes_compra.tipos_orden 
      WHERE activa = true
      ORDER BY nombre
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo tipos de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de orden',
      error: error.message
    });
  }
});

module.exports = router;

