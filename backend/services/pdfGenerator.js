const PDFDocument = require('pdfkit');
const { EMPRESA_CONFIG } = require('../utils/constants');

async function generateOrderPdf(ordenData, items, total, visualPreview = null) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 20, bottom: 20, left: 20, right: 20 }
      });

      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);

      // Si tenemos vista previa visual, mostrarla
      if (visualPreview) {
        // Convertir base64 a buffer
        const base64Data = visualPreview.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Usar el ancho completo de la página (menos márgenes pequeños)
        const imageWidth = doc.page.width - 20; // Márgenes mínimos
        const y = 10; // Posición vertical
        
        // Agregar la imagen sin escalar - mantener proporción original
        doc.image(imageBuffer, {
          x: 10,
          y: y,
          width: imageWidth,
          // No especificar height para mantener proporción original
        });
        
        // Mover el cursor después de la imagen (se ajustará automáticamente)
        doc.y = doc.y + 20;
      } else {
        // Si no hay vista previa, mostrar información básica
        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('ORDEN DE COMPRA', { align: 'center' });
        
        doc.moveDown(2);
        
        doc.fontSize(12).font('Helvetica')
           .text(`Número: ${ordenData.numero_oc}`, 50, doc.y)
           .text(`Proveedor: ${ordenData.proveedor_nombre}`, 50, doc.y + 20)
           .text(`Total: S/ ${total.toFixed(2)}`, 50, doc.y + 40);
        
        doc.y += 80;
      }

      // Sección de firmas con diseño elegante
      const signatureY = doc.y + 20;
      const sigWidth = 200;
      const sigHeight = 60;
      const sigSpacing = 50;
      
      // Cuadro de firma izquierdo con gradiente
      doc.rect(50, signatureY, sigWidth, sigHeight)
         .fill('#f5f5f5')
         .stroke('#d0d0d0');
      
      // Gradiente simulado con líneas
      for (let i = 0; i < 10; i++) {
        const alpha = 0.1 - (i * 0.01);
        doc.rect(50, signatureY + (i * 6), sigWidth, 6)
           .fill(`rgba(128, 128, 128, ${alpha})`);
      }
      
      // Cuadro de sello derecho con gradiente
      doc.rect(50 + sigWidth + sigSpacing, signatureY, sigWidth, sigHeight)
         .fill('#f5f5f5')
         .stroke('#d0d0d0');
      
      // Gradiente simulado con líneas
      for (let i = 0; i < 10; i++) {
        const alpha = 0.1 - (i * 0.01);
        doc.rect(50 + sigWidth + sigSpacing, signatureY + (i * 6), sigWidth, 6)
           .fill(`rgba(128, 128, 128, ${alpha})`);
      }
      
      // Textos "FIRMA" y "SELLO" debajo de los cuadros
      doc.fillColor('#666666').fontSize(10).font('Helvetica-Bold')
         .text('FIRMA', 50, signatureY + sigHeight + 10, { align: 'center', width: sigWidth })
         .text('SELLO', 50 + sigWidth + sigSpacing, signatureY + sigHeight + 10, { align: 'center', width: sigWidth });
      
      // Footer
      doc.moveDown(4);
      doc.fontSize(8).font('Helvetica')
         .fillColor('#7f8c8d')
         .text(`Documento generado el ${new Date().toLocaleString('es-PE')}`, { align: 'center' })
         .text('Sistema de Órdenes de Compra - LADP', { align: 'center' });

      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateOrderPdf };