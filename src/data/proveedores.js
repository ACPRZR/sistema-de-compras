/**
 * Base de datos de proveedores preferenciales por categoría
 */

export const PROVEEDORES_DB = {
  tecnologia: [
    {
      id: 'tech_001',
      nombre: 'TechPeru SAC',
      ruc: '20123456789',
      contacto: 'Juan Pérez',
      telefono: '999-888-777',
      email: 'ventas@techperu.com',
      direccion: 'Av. Javier Prado 1234, San Isidro',
      especialidad: 'Equipos de cómputo y software',
      calificacion: 4.8,
      tiempoEntrega: '3-5 días'
    },
    {
      id: 'tech_002',
      nombre: 'Sistemas Integrales',
      ruc: '20234567890',
      contacto: 'María García',
      telefono: '998-777-666',
      email: 'contacto@sistemasint.com',
      direccion: 'Av. Arequipa 5678, Miraflores',
      especialidad: 'Servicios de TI y consultoría',
      calificacion: 4.6,
      tiempoEntrega: '5-7 días'
    },
    {
      id: 'tech_003',
      nombre: 'Digital Solutions',
      ruc: '20345678901',
      contacto: 'Carlos Mendoza',
      telefono: '997-666-555',
      email: 'info@digitalsolutions.pe',
      direccion: 'Av. Larco 9012, Miraflores',
      especialidad: 'Equipos audiovisuales',
      calificacion: 4.7,
      tiempoEntrega: '2-4 días'
    }
  ],
  
  oficina: [
    {
      id: 'office_001',
      nombre: 'OfficeMax Perú',
      ruc: '20345678901',
      contacto: 'Carlos López',
      telefono: '997-666-555',
      email: 'ventas@officemax.pe',
      direccion: 'Av. Angamos 3456, Surco',
      especialidad: 'Útiles de oficina y papelería',
      calificacion: 4.5,
      tiempoEntrega: '1-2 días'
    },
    {
      id: 'office_002',
      nombre: 'Papelería Central',
      ruc: '20456789012',
      contacto: 'Ana Rodríguez',
      telefono: '996-555-444',
      email: 'pedidos@papeleria.com',
      direccion: 'Av. Grau 7890, Lima',
      especialidad: 'Material de oficina',
      calificacion: 4.3,
      tiempoEntrega: '2-3 días'
    }
  ],
  
  limpieza: [
    {
      id: 'clean_001',
      nombre: 'Productos de Limpieza S.A.',
      ruc: '20567890123',
      contacto: 'Luis Martín',
      telefono: '995-444-333',
      email: 'ventas@limpieza.com',
      direccion: 'Av. Túpac Amaru 1234, Independencia',
      especialidad: 'Productos de limpieza industrial',
      calificacion: 4.4,
      tiempoEntrega: '1-3 días'
    },
    {
      id: 'clean_002',
      nombre: 'Higiene Total',
      ruc: '20678901234',
      contacto: 'Elena Torres',
      telefono: '994-333-222',
      email: 'contacto@higiene.pe',
      direccion: 'Av. Universitaria 5678, San Miguel',
      especialidad: 'Insumos de higiene y limpieza',
      calificacion: 4.6,
      tiempoEntrega: '2-4 días'
    }
  ],
  
  mantenimiento: [
    {
      id: 'maint_001',
      nombre: 'Mantenimiento Integral',
      ruc: '20789012345',
      contacto: 'Roberto Silva',
      telefono: '993-222-111',
      email: 'servicios@mantenimiento.pe',
      direccion: 'Av. El Sol 9012, Ate',
      especialidad: 'Servicios de mantenimiento general',
      calificacion: 4.7,
      tiempoEntrega: '3-5 días'
    },
    {
      id: 'maint_002',
      nombre: 'Construcciones LADP',
      ruc: '20890123456',
      contacto: 'Miguel Vargas',
      telefono: '992-111-000',
      email: 'proyectos@construcciones.pe',
      direccion: 'Av. La Marina 3456, Callao',
      especialidad: 'Materiales de construcción',
      calificacion: 4.8,
      tiempoEntrega: '5-7 días'
    }
  ],
  
  audiovisuales: [
    {
      id: 'audio_001',
      nombre: 'Audio Visual Pro',
      ruc: '20901234567',
      contacto: 'Patricia Ramos',
      telefono: '991-000-999',
      email: 'ventas@audiovisualpro.com',
      direccion: 'Av. Brasil 7890, Magdalena',
      especialidad: 'Equipos de sonido e iluminación',
      calificacion: 4.9,
      tiempoEntrega: '2-3 días'
    }
  ],
  
  mobiliario: [
    {
      id: 'mob_001',
      nombre: 'Muebles Corporativos',
      ruc: '20112345678',
      contacto: 'Fernando Castro',
      telefono: '990-999-888',
      email: 'ventas@mueblescorp.pe',
      direccion: 'Av. Primavera 1234, Chorrillos',
      especialidad: 'Mobiliario de oficina',
      calificacion: 4.5,
      tiempoEntrega: '7-10 días'
    }
  ],
  
  servicios: [
    {
      id: 'serv_001',
      nombre: 'Servicios Generales LADP',
      ruc: '20123456789',
      contacto: 'Carmen Flores',
      telefono: '989-888-777',
      email: 'servicios@ladp.org.pe',
      direccion: 'Av. Colombia 325, San Isidro',
      especialidad: 'Servicios administrativos',
      calificacion: 4.8,
      tiempoEntrega: '1-2 días'
    }
  ]
};

/**
 * Obtener proveedores por categoría
 * @param {string} categoria - Categoría de compra
 * @returns {Array} - Lista de proveedores
 */
export const getProveedoresByCategoria = (categoria) => {
  return PROVEEDORES_DB[categoria] || [];
};

/**
 * Buscar proveedor por RUC
 * @param {string} ruc - RUC del proveedor
 * @returns {Object|null} - Proveedor encontrado
 */
export const findProveedorByRUC = (ruc) => {
  for (const categoria in PROVEEDORES_DB) {
    const proveedor = PROVEEDORES_DB[categoria].find(p => p.ruc === ruc);
    if (proveedor) return proveedor;
  }
  return null;
};

/**
 * Obtener todos los proveedores
 * @returns {Array} - Lista de todos los proveedores
 */
export const getAllProveedores = () => {
  const allProveedores = [];
  for (const categoria in PROVEEDORES_DB) {
    allProveedores.push(...PROVEEDORES_DB[categoria]);
  }
  return allProveedores;
};
