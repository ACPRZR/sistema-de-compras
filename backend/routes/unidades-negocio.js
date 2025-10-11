const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/unidades-negocio - Obtener todas las unidades de negocio activas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, codigo, nombre, descripcion, activa
      FROM ordenes_compra.unidades_negocio 
      WHERE activa = true
      ORDER BY nombre
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo unidades de negocio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener unidades de negocio',
      error: error.message
    });
  }
});

module.exports = router;

