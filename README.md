# Sistema de Órdenes de Compra - LADP

Un sistema profesional de gestión de órdenes de compra desarrollado con React y Tailwind CSS para Las Asambleas de Dios del Perú.

## 🚀 Características

- **Interfaz moderna y profesional** con diseño de nivel empresarial
- **Sistema inteligente de numeración** de órdenes de compra
- **Timeline visual** para seguimiento del estado de las órdenes
- **Base de datos de proveedores** categorizados por tipo de compra
- **Templates de items** para agilizar la creación de órdenes
- **Generación automática** de documentos de orden de compra
- **Validaciones inteligentes** y manejo de errores
- **Responsive design** que funciona en todos los dispositivos
- **Persistencia de datos** con localStorage

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **Tailwind CSS** - Framework de CSS utilitario
- **Heroicons** - Iconografía profesional
- **Framer Motion** - Animaciones suaves
- **React Hot Toast** - Notificaciones elegantes
- **Date-fns** - Manipulación de fechas

## 📦 Instalación

### Prerrequisitos

- Node.js 16 o superior
- npm o yarn

### Pasos de instalación

1. **Clonar o descargar el proyecto**
   ```bash
   # Si tienes git
   git clone <url-del-repositorio>
   cd react-sistema-ordenes
   
   # O simplemente extraer el archivo ZIP en una carpeta
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   # o
   yarn start
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── Layout/           # Componentes de layout (Header, Sidebar, Layout)
│   ├── Forms/            # Formularios (Información, Proveedores, Items)
│   ├── Timeline/         # Componentes del timeline de estados
│   ├── OrdenCompra/      # Generación y visualización de órdenes
│   └── UI/               # Componentes reutilizables (Button, Input, Select)
├── hooks/                # Hooks personalizados
├── utils/                # Utilidades y formatters
├── data/                 # Datos estáticos (proveedores, templates)
└── App.jsx              # Componente principal
```

## 🎨 Personalización

### Colores del tema

Los colores se pueden personalizar en `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#3b82f6',  // Azul principal
    600: '#2563eb',
    // ...
  },
  success: {
    500: '#22c55e',  // Verde para éxito
    // ...
  }
  // ...
}
```

### Agregar nuevos proveedores

Edita `src/data/proveedores.js` para agregar nuevos proveedores:

```javascript
export const PROVEEDORES_DB = {
  tecnologia: [
    {
      id: 'tech_001',
      nombre: 'Nuevo Proveedor',
      ruc: '20123456789',
      // ...
    }
  ]
};
```

### Agregar templates de items

Edita `src/data/templates.js` para agregar nuevos templates:

```javascript
export const TEMPLATES_ITEMS = {
  tecnologia: [
    {
      id: 'template_001',
      descripcion: 'Nuevo Item',
      unidad: 'Unidad',
      precio: 100,
      // ...
    }
  ]
};
```

## 📱 Funcionalidades

### 1. Información Organizacional
- Selección de unidad de negocio
- Unidad que autoriza
- Ubicación de entrega con direcciones predefinidas
- Datos de proyecto opcionales

### 2. Información General
- Generación automática de número de OC
- Categorización de compras
- Tipos de orden (Standard/Blanket)
- Fecha de requerimiento

### 3. Gestión de Proveedores
- Base de datos de proveedores preferenciales
- Información de contacto opcional
- Validación de RUC y email
- Agregado rápido de nuevos proveedores

### 4. Items de la Orden
- Gestión dinámica de items
- Templates por categoría
- Cálculo automático de subtotales
- Múltiples unidades de medida

### 5. Timeline de Estados
- Seguimiento visual del progreso
- Estados: Creada → Revisión → Aprobada → Enviada → Completada
- Actualización en tiempo real
- Responsables automáticos

### 6. Generación de Órdenes
- Documento profesional completo
- Exportación a TXT
- Envío por email
- Copia al portapapeles

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start

# Construcción para producción
npm run build

# Ejecutar tests
npm test

# Eyectar configuración (no recomendado)
npm run eject
```

## 📋 Próximas Funcionalidades

- [ ] Importación de items desde CSV
- [ ] Historial de órdenes
- [ ] Dashboard de estadísticas
- [ ] Notificaciones push
- [ ] Integración con base de datos
- [ ] Sistema de usuarios y roles
- [ ] Aprobaciones digitales
- [ ] Generación de PDFs

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Álvaro Pérez Román** - Departamento de Logística - LADP
- **Desarrollo Frontend** - React + Tailwind CSS

## 📞 Soporte

Para soporte técnico o consultas:
- Email: logistica@ladp.org.pe
- Teléfono: 915359876

---

**Las Asambleas de Dios del Perú**  
*"Cristo salva, sana, santifica, bautiza con el Espíritu Santo y viene otra vez con poder"*
