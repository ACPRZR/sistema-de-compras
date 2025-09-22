const express = require('express');
const router = express.Router();

// GET /api/unidades-medida - Obtener todas las unidades de medida
router.get('/', async (req, res) => {
  try {
    const { query } = require('../config/database');
    
    const unidades = await query(`
      SELECT id, codigo, nombre, simbolo, activa
      FROM ordenes_compra.unidades_medida 
      WHERE activa = true 
      ORDER BY nombre
    `);

    res.json({
      success: true,
      data: unidades.rows || unidades
    });
  } catch (error) {
    console.error('Error obteniendo unidades de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/unidades-medida/:id - Obtener unidad de medida por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = require('../config/database');
    
    const unidades = await query(`
      SELECT id, codigo, nombre, simbolo, activa
      FROM ordenes_compra.unidades_medida 
      WHERE id = $1 AND activa = true
    `, [id]);

    if (unidades.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada'
      });
    }

    res.json({
      success: true,
      data: unidades.rows ? unidades.rows[0] : unidades[0]
    });
  } catch (error) {
    console.error('Error obteniendo unidad de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
