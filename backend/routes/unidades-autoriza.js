const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/unidades-autoriza - Obtener todas las unidades que autorizan activas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, codigo, nombre, descripcion, activa
      FROM ordenes_compra.unidades_autoriza 
      WHERE activa = true
      ORDER BY nombre
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error obteniendo unidades que autorizan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener unidades que autorizan',
      error: error.message
    });
  }
});

module.exports = router;

