const express = require('express');
const router = express.Router();

// GET /api/categorias - Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    // Por ahora, devolver categorías hardcodeadas hasta que se implemente la tabla
    const categorias = [
      { id: 1, codigo: 'tecnologia', nombre: 'Tecnología e Informática', descripcion: 'Equipos de cómputo, software y servicios IT' },
      { id: 2, codigo: 'oficina', nombre: 'Oficina y Papelería', descripcion: 'Artículos de oficina, papelería y útiles' },
      { id: 3, codigo: 'limpieza', nombre: 'Limpieza y Mantenimiento', descripcion: 'Productos de limpieza y mantenimiento' },
      { id: 4, codigo: 'construccion', nombre: 'Construcción y Obras', descripcion: 'Materiales de construcción y servicios' },
      { id: 5, codigo: 'audiovisual', nombre: 'Audio Visual', descripcion: 'Equipos de audio, video y presentación' },
      { id: 6, codigo: 'mobiliario', nombre: 'Mobiliario', descripcion: 'Muebles y equipamiento de oficina' },
      { id: 7, codigo: 'servicios', nombre: 'Servicios Generales', descripcion: 'Servicios diversos y consultoría' }
    ];

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/categorias/:id - Obtener categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const categorias = [
      { id: 1, codigo: 'tecnologia', nombre: 'Tecnología e Informática', descripcion: 'Equipos de cómputo, software y servicios IT' },
      { id: 2, codigo: 'oficina', nombre: 'Oficina y Papelería', descripcion: 'Artículos de oficina, papelería y útiles' },
      { id: 3, codigo: 'limpieza', nombre: 'Limpieza y Mantenimiento', descripcion: 'Productos de limpieza y mantenimiento' },
      { id: 4, codigo: 'construccion', nombre: 'Construcción y Obras', descripcion: 'Materiales de construcción y servicios' },
      { id: 5, codigo: 'audiovisual', nombre: 'Audio Visual', descripcion: 'Equipos de audio, video y presentación' },
      { id: 6, codigo: 'mobiliario', nombre: 'Mobiliario', descripcion: 'Muebles y equipamiento de oficina' },
      { id: 7, codigo: 'servicios', nombre: 'Servicios Generales', descripcion: 'Servicios diversos y consultoría' }
    ];

    const categoria = categorias.find(c => c.id === parseInt(id));
    
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;
