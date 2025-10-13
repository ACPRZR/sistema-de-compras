const express = require('express');
const router = express.Router();
const { generateOrderPdf } = require('../services/pdfGenerator');
const pool = require('../config/database');

/**
 * GET /api/pdf/orden/:id - Generar PDF de orden de compra
 */
router.get('/orden/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener datos de la orden
    const ordenQuery = `
      SELECT 
        oc.*,
        c.nombre as categoria_nombre,
        cp.nombre as condiciones_pago_nombre,
        u.nombre_completo as comprador_nombre,
        aprobador.nombre_completo as aprobador_nombre,
        aprobador.cargo as aprobador_cargo,
        aprobador.dni as aprobador_dni
      FROM ordenes_compra.ordenes_compra oc
      LEFT JOIN ordenes_compra.categorias_compra c ON oc.categoria_id = c.id
      LEFT JOIN ordenes_compra.condiciones_pago cp ON oc.condiciones_pago_id = cp.id
      LEFT JOIN ordenes_compra.usuarios u ON oc.comprador_responsable_id = u.id
      LEFT JOIN ordenes_compra.usuarios aprobador ON oc.aprobador_id = aprobador.id
      WHERE oc.id = $1
    `;
    
    const ordenResult = await pool.query(ordenQuery, [id]);
    
    if (ordenResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }
    
    const orden = ordenResult.rows[0];
    
    // Obtener items de la orden
    const itemsQuery = `
      SELECT 
        oi.*,
        um.nombre as unidad_nombre
      FROM ordenes_compra.orden_items oi
      LEFT JOIN ordenes_compra.unidades_medida um ON oi.unidad_id = um.id
      WHERE oi.orden_id = $1
      ORDER BY oi.item_numero
    `;
    
    const itemsResult = await pool.query(itemsQuery, [id]);
    const items = itemsResult.rows.map(item => ({
      descripcion: item.descripcion,
      cantidad: parseFloat(item.cantidad) || 0,
      unidad: item.unidad_nombre || 'Unidad',
      precio: parseFloat(item.precio_unitario) || 0,
      subtotal: parseFloat(item.subtotal) || 0
    }));
    
    // Calcular total (asegurarse de que sea un número)
    const total = parseFloat(items.reduce((sum, item) => sum + (item.subtotal || 0), 0));
    
    // Generar PDF
    const pdfBuffer = await generateOrderPdf(orden, items, total);
    
    // Configurar headers para mostrar en navegador
    const filename = `OC-${orden.numero_oc}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`); // Cambiado de "attachment" a "inline"
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * POST /api/pdf/orden - Generar PDF de orden temporal (sin guardar en BD)
 */
router.post('/orden', async (req, res) => {
  try {
    const { ordenData, items, visualPreview } = req.body;
    
    if (!ordenData || !items) {
      return res.status(400).json({
        success: false,
        message: 'Datos de orden e items son requeridos'
      });
    }
    
    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    
    // Generar PDF con vista previa visual
    const pdfBuffer = await generateOrderPdf(ordenData, items, total, visualPreview);
    
    // Configurar headers para descarga
    const filename = `OC-${ordenData.numero_oc || 'TEMP'}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generando PDF temporal:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
