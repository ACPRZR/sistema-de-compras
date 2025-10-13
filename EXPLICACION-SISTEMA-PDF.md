# 📄 Sistema de Generación de PDFs - Explicación Completa

## 📅 Fecha: 13 de Octubre, 2025

---

## 🔍 **CÓMO FUNCIONA ACTUALMENTE**

### **1. Tecnología Utilizada: PDFKit**

**PDFKit** es una librería de Node.js para generar documentos PDF programáticamente.

#### ✅ **Ventajas de PDFKit:**
- ✅ **Ligero**: Solo ~500 KB, no requiere dependencias pesadas
- ✅ **100% JavaScript**: No necesita binarios externos
- ✅ **Control total**: Dibujas el PDF píxel por píxel
- ✅ **Streaming**: Genera PDFs on-the-fly sin guardar en disco
- ✅ **Soporte de fuentes**: Puede usar fuentes personalizadas

#### ❌ **Desventajas de PDFKit:**
- ❌ **Manual**: Debes calcular posiciones, tamaños, saltos de página
- ❌ **Sin templates HTML**: No puedes usar HTML/CSS directamente
- ❌ **Código verboso**: Mucho código para layouts complejos
- ❌ **Difícil de mantener**: Cambiar el diseño requiere ajustar muchas coordenadas

---

## 🏗️ **ARQUITECTURA ACTUAL**

### **Flujo de Generación:**

```
1. Usuario click "Ver PDF" 
   ↓
2. Frontend llama: GET /api/pdf/orden/:id
   ↓
3. Backend (routes/pdf.js):
   - Consulta orden en PostgreSQL
   - Consulta items de la orden
   - Llama a pdfGenerator.js
   ↓
4. Backend (services/pdfGenerator.js):
   - Crea documento PDFDocument
   - Dibuja contenido con coordenadas (x, y)
   - Agrega imágenes (si hay visualPreview)
   - Dibuja cuadros de firma/sello
   - Retorna buffer
   ↓
5. Backend envía PDF al navegador
   ↓
6. Navegador abre PDF en nueva pestaña
```

---

## 🔧 **CÓDIGO ACTUAL EXPLICADO**

### **A. Ruta del Endpoint (`backend/routes/pdf.js`)**

```javascript
router.get('/orden/:id', async (req, res) => {
  // 1. Obtener ID de la orden
  const { id } = req.params;
  
  // 2. Consultar orden + datos relacionados (LEFT JOIN)
  const ordenQuery = `
    SELECT 
      oc.*,
      c.nombre as categoria_nombre,
      cp.nombre as condiciones_pago_nombre,
      u.nombre as comprador_nombre,
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
  
  // 3. Consultar items de la orden
  const itemsQuery = `
    SELECT 
      oi.*,
      um.nombre as unidad_nombre
    FROM ordenes_compra.orden_items oi
    LEFT JOIN ordenes_compra.unidades_medida um ON oi.unidad_id = um.id
    WHERE oi.orden_id = $1
    ORDER BY oi.item_numero
  `;
  
  // 4. Generar PDF
  const pdfBuffer = await generateOrderPdf(orden, items, total);
  
  // 5. Configurar headers HTTP
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // 6. Enviar PDF
  res.send(pdfBuffer);
});
```

**Problema actual**: El header `Content-Disposition: attachment` **fuerza la descarga** en lugar de mostrar el PDF en el navegador.

---

### **B. Generador de PDF (`backend/services/pdfGenerator.js`)**

```javascript
async function generateOrderPdf(ordenData, items, total, visualPreview = null) {
  return new Promise((resolve, reject) => {
    // 1. Crear documento PDF (tamaño A4)
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 }
    });

    // 2. Capturar el PDF en memoria (buffers)
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // 3. Si hay visualPreview (imagen base64 desde frontend)
    if (visualPreview) {
      // Convertir base64 a buffer
      const base64Data = visualPreview.replace(/^data:image\/png;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Agregar imagen al PDF
      doc.image(imageBuffer, {
        x: 10,
        y: 10,
        width: doc.page.width - 20
      });
    } else {
      // Si no hay imagen, dibujar texto básico
      doc.fontSize(16).font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text('ORDEN DE COMPRA', { align: 'center' });
      
      doc.fontSize(12).font('Helvetica')
         .text(`Número: ${ordenData.numero_oc}`, 50, doc.y)
         .text(`Proveedor: ${ordenData.proveedor_nombre}`, 50, doc.y + 20);
    }

    // 4. Dibujar cuadros de FIRMA y SELLO (coordenadas fijas)
    const signatureY = doc.page.height - 120;
    const sigWidth = 200;
    const sigHeight = 60;
    
    doc.rect(50, signatureY, sigWidth, sigHeight)
       .fill('#f5f5f5')
       .stroke('#d0d0d0');
    
    doc.text('FIRMA', 50, signatureY + sigHeight + 10, { 
      align: 'center', 
      width: sigWidth 
    });

    // 5. Agregar información del aprobador
    if (ordenData.aprobador_nombre) {
      doc.fontSize(9)
         .text(ordenData.aprobador_nombre, 50, signatureY + sigHeight + 30)
         .text(ordenData.aprobador_cargo, 50, signatureY + sigHeight + 45)
         .text(`DNI: ${ordenData.aprobador_dni}`, 50, signatureY + sigHeight + 58);
    }

    // 6. Finalizar el PDF
    doc.end();
  });
}
```

**Problemas actuales**:
1. ❌ El PDF solo muestra una **imagen capturada del frontend** (no es texto seleccionable)
2. ❌ Si no hay `visualPreview`, solo muestra info básica
3. ❌ No hay tabla de items, precios, o detalles estructurados
4. ❌ Layout muy simple y poco profesional

---

## 🚨 **PROBLEMA PRINCIPAL: ¿POR QUÉ NO SE MUESTRA EL PDF?**

### **Causa:**
```javascript
res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
```

El header `attachment` le dice al navegador: **"Descarga este archivo"**.

### **Solución:**
```javascript
// Para MOSTRAR en el navegador:
res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

// O simplemente no enviar Content-Disposition
```

---

## 🎨 **ALTERNATIVAS MEJORES PARA GENERAR PDFs**

### **1. Puppeteer (Recomendado para tu caso)**

**¿Qué es?** Un navegador Chrome headless (sin interfaz) controlado por Node.js.

#### ✅ **Ventajas:**
- ✅ **Usas HTML + CSS**: Diseñas el PDF como una página web
- ✅ **Componentes React**: Puedes reutilizar tus componentes
- ✅ **Fácil de mantener**: Cambiar diseño = cambiar HTML/CSS
- ✅ **Resultado profesional**: Igual que imprimir una página web
- ✅ **Soporte de tablas, gráficos, fuentes**: Todo lo que funciona en web

#### ❌ **Desventajas:**
- ❌ **Pesado**: ~280 MB (incluye Chrome)
- ❌ **Más lento**: ~2-3 segundos por PDF
- ❌ **Consume RAM**: ~100-200 MB por instancia

#### 📝 **Ejemplo de implementación:**

```javascript
// backend/services/pdfGeneratorPuppeteer.js
const puppeteer = require('puppeteer');

async function generateOrderPdf(ordenData, items, total) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // HTML con estilos embebidos
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { 
          size: A4; 
          margin: 20mm; 
        }
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 12pt;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 200px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #4CAF50;
          color: white;
        }
        .total {
          font-size: 18pt;
          font-weight: bold;
          text-align: right;
          margin-top: 20px;
        }
        .firma-section {
          display: flex;
          justify-content: space-around;
          margin-top: 80px;
        }
        .firma-box {
          width: 200px;
          height: 80px;
          border: 2px solid #333;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://tu-dominio.com/logo.png" class="logo" />
        <h1>ORDEN DE COMPRA</h1>
        <p><strong>N°:</strong> ${ordenData.numero_oc}</p>
      </div>
      
      <table>
        <tr>
          <td><strong>Proveedor:</strong></td>
          <td>${ordenData.proveedor_nombre}</td>
          <td><strong>RUC:</strong></td>
          <td>${ordenData.proveedor_ruc || 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Fecha:</strong></td>
          <td>${new Date(ordenData.fecha_creacion).toLocaleDateString('es-PE')}</td>
          <td><strong>Categoría:</strong></td>
          <td>${ordenData.categoria_nombre}</td>
        </tr>
      </table>
      
      <h3>Items Solicitados</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.descripcion}</td>
              <td>${item.cantidad}</td>
              <td>${item.unidad}</td>
              <td>S/ ${item.precio.toFixed(2)}</td>
              <td>S/ ${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        TOTAL: S/ ${total.toFixed(2)}
      </div>
      
      <div class="firma-section">
        <div>
          <div class="firma-box"></div>
          <p><strong>FIRMA</strong></p>
          <p>${ordenData.aprobador_nombre || ''}</p>
          <p>${ordenData.aprobador_cargo || ''}</p>
          <p>DNI: ${ordenData.aprobador_dni || 'N/A'}</p>
        </div>
        <div>
          <div class="firma-box"></div>
          <p><strong>SELLO</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
  });
  
  await browser.close();
  
  return pdfBuffer;
}
```

**Instalación:**
```bash
npm install puppeteer
```

---

### **2. PDFMake (Alternativa Media)**

**¿Qué es?** Librería similar a PDFKit pero con sintaxis más declarativa (JSON-like).

#### ✅ **Ventajas:**
- ✅ **Más fácil que PDFKit**: Sintaxis tipo configuración
- ✅ **Tablas built-in**: Soporte nativo para tablas complejas
- ✅ **Ligero**: ~1 MB
- ✅ **Rápido**: Genera PDFs en milisegundos

#### ❌ **Desventajas:**
- ❌ **Menos flexible**: No tienes control total como PDFKit
- ❌ **Sin HTML**: Sigues sin poder usar HTML/CSS

#### 📝 **Ejemplo:**
```javascript
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function generateOrderPdf(ordenData, items, total) {
  const docDefinition = {
    content: [
      { text: 'ORDEN DE COMPRA', style: 'header' },
      { text: `N°: ${ordenData.numero_oc}`, style: 'subheader' },
      {
        table: {
          widths: ['*', '*'],
          body: [
            ['Proveedor:', ordenData.proveedor_nombre],
            ['RUC:', ordenData.proveedor_ruc || 'N/A'],
            ['Fecha:', new Date().toLocaleDateString('es-PE')]
          ]
        }
      },
      { text: 'Items Solicitados', style: 'subheader' },
      {
        table: {
          headerRows: 1,
          widths: [20, '*', 50, 50, 70, 70],
          body: [
            ['#', 'Descripción', 'Cant.', 'Unidad', 'Precio', 'Subtotal'],
            ...items.map((item, i) => [
              i + 1,
              item.descripcion,
              item.cantidad,
              item.unidad,
              `S/ ${item.precio.toFixed(2)}`,
              `S/ ${item.subtotal.toFixed(2)}`
            ])
          ]
        }
      },
      { text: `TOTAL: S/ ${total.toFixed(2)}`, style: 'total' }
    ],
    styles: {
      header: { fontSize: 18, bold: true, alignment: 'center' },
      subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
      total: { fontSize: 16, bold: true, alignment: 'right', margin: [0, 20] }
    }
  };

  return new Promise((resolve, reject) => {
    const printer = new pdfMake.createPdf(docDefinition);
    printer.getBuffer((buffer) => {
      resolve(buffer);
    });
  });
}
```

---

### **3. React-PDF (Si quieres usar React)**

**¿Qué es?** Renderiza componentes React a PDFs.

#### ✅ **Ventajas:**
- ✅ **100% React**: Usas JSX y componentes
- ✅ **Reutilizas código**: Mismos componentes del frontend
- ✅ **TypeScript support**: Tipado completo

#### ❌ **Desventajas:**
- ❌ **Solo funciona en frontend**: No sirve para backend Node.js puro
- ❌ **Limitaciones de CSS**: No todo el CSS funciona

---

## 🏆 **RECOMENDACIÓN PARA TU SISTEMA**

### **Opción 1: Puppeteer (Mejor calidad)**
**Cuándo usarla:**
- ✅ Necesitas PDFs profesionales con diseño complejo
- ✅ Quieres tablas, colores, logos, gráficos
- ✅ No te importa el tamaño (~280 MB) ni la velocidad (~2-3 seg)
- ✅ Quieres reutilizar HTML/CSS del frontend

**Instalación:**
```bash
cd backend
npm install puppeteer
```

**Costo:**
- Espacio: ~280 MB
- RAM: ~150 MB por instancia
- Tiempo: ~2-3 segundos por PDF

---

### **Opción 2: PDFMake (Balance)**
**Cuándo usarla:**
- ✅ Necesitas PDFs decentes pero simples
- ✅ Quieres velocidad (<100ms)
- ✅ No quieres dependencias pesadas
- ✅ Tablas y texto principalmente

**Instalación:**
```bash
cd backend
npm install pdfmake
```

**Costo:**
- Espacio: ~1 MB
- RAM: ~20 MB
- Tiempo: ~50-100 ms

---

### **Opción 3: Mejorar PDFKit (Actual)**
**Cuándo usarla:**
- ✅ Quieres mantener lo que tienes
- ✅ PDFs muy simples
- ✅ Sin dependencias adicionales

**Mejoras necesarias:**
1. Agregar tabla de items con bucle
2. Mejorar layout con colores y logos
3. Agregar headers/footers en cada página
4. Manejar saltos de página correctamente

---

## 🔧 **SOLUCIÓN INMEDIATA: ARREGLAR EL "VER PDF"**

```javascript
// backend/routes/pdf.js - Línea 72
// ANTES (descarga el PDF):
res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

// DESPUÉS (muestra el PDF en el navegador):
res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
```

---

## 📊 **COMPARATIVA FINAL**

| Característica | PDFKit (Actual) | PDFMake | Puppeteer |
|----------------|----------------|---------|-----------|
| **Instalación** | ✅ Ya instalado | ✅ ~1 MB | ⚠️ ~280 MB |
| **Velocidad** | ✅ <50ms | ✅ <100ms | ⚠️ ~2-3 seg |
| **Calidad** | ❌ Básica | ⚠️ Media | ✅ Profesional |
| **Tablas** | ❌ Manual | ✅ Nativo | ✅ HTML |
| **HTML/CSS** | ❌ No | ❌ No | ✅ Sí |
| **Curva aprendizaje** | ⚠️ Media | ✅ Fácil | ✅ Fácil |
| **Mantenimiento** | ❌ Difícil | ⚠️ Medio | ✅ Fácil |

---

## 💡 **MI RECOMENDACIÓN PERSONAL**

Para tu sistema de órdenes de compra, te recomiendo **Puppeteer** porque:

1. ✅ **PDFs profesionales** que se ven como documentos oficiales
2. ✅ **Fácil de mantener**: Solo editas HTML/CSS
3. ✅ **Puedes usar templates**: Ejs, Handlebars, o JSX
4. ✅ **Escalable**: Puedes agregar gráficos, QR codes, firmas digitales
5. ✅ **No te importa el peso**: 280 MB es aceptable en servidores modernos

**¿Quieres que implemente Puppeteer en tu sistema?** 🚀

