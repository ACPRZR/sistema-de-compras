const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/condiciones-pago - Obtener todas las condiciones de pago activas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, codigo, nombre, activa
      FROM ordenes_compra.condiciones_pago 
      WHERE activa = true
      ORDER BY nombre
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo condiciones de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener condiciones de pago',
      error: error.message
    });
  }
});

module.exports = router;

