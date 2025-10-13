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

      // Variables para posicionamiento fijo
      let imageHeight = 0;
      const pageHeight = doc.page.height;
      const marginBottom = 40; // Espacio mínimo desde el fondo
      
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
        
        // Calcular la altura real de la imagen basada en su proporción original
        // Usamos una aproximación: si la imagen es muy alta, asumimos que ocupará múltiples páginas
        // y calculamos la altura basada en el ancho proporcionado
        const originalWidth = imageWidth; // Ancho al que estamos escalando
        const aspectRatio = 1.414; // Proporción A4 aproximada (ancho/alto)
        imageHeight = originalWidth / aspectRatio; // Altura estimada basada en proporción A4
        
        // Si la imagen es muy alta, limitamos a una altura razonable por página
        const maxHeightPerPage = pageHeight - 200; // Dejamos espacio para firmas
        if (imageHeight > maxHeightPerPage) {
          imageHeight = maxHeightPerPage;
        }
        
        // Mover el cursor después de la imagen
        doc.y = y + imageHeight + 20;
      } else {
        // Si no hay vista previa, mostrar información básica
        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('ORDEN DE COMPRA', { align: 'center' });
        
        doc.moveDown(2);
        
        doc.fontSize(12).font('Helvetica')
           .text(`Número: ${ordenData.numero_oc}`, 50, doc.y)
           .text(`Proveedor: ${ordenData.proveedor_nombre}`, 50, doc.y + 20)
           .text(`Total: S/ ${parseFloat(total || 0).toFixed(2)}`, 50, doc.y + 40);
        
        doc.y += 80;
        imageHeight = 80; // Altura estimada del contenido básico
      }

      // Calcular posición fija para los elementos de firma y sello
      // Siempre a 8cm del final de la página, independientemente del contenido
      const signatureY = pageHeight - 120; // 8cm desde el fondo (120 puntos ≈ 4.2cm)
      const sigWidth = 200;
      const sigHeight = 60;
      const sigSpacing = 50;
      
      // Verificar si necesitamos una nueva página para las firmas
      if (doc.y > signatureY - 20) {
        doc.addPage();
        // Recalcular posición en la nueva página
        const newSignatureY = doc.page.height - 120;
        
        // Cuadro de firma izquierdo con gradiente
        doc.rect(50, newSignatureY, sigWidth, sigHeight)
           .fill('#f5f5f5')
           .stroke('#d0d0d0');
        
        // Gradiente simulado con líneas
        for (let i = 0; i < 10; i++) {
          const alpha = 0.1 - (i * 0.01);
          doc.rect(50, newSignatureY + (i * 6), sigWidth, 6)
             .fill(`rgba(128, 128, 128, ${alpha})`);
        }
        
        // Cuadro de sello derecho con gradiente
        doc.rect(50 + sigWidth + sigSpacing, newSignatureY, sigWidth, sigHeight)
           .fill('#f5f5f5')
           .stroke('#d0d0d0');
        
        // Gradiente simulado con líneas
        for (let i = 0; i < 10; i++) {
          const alpha = 0.1 - (i * 0.01);
          doc.rect(50 + sigWidth + sigSpacing, newSignatureY + (i * 6), sigWidth, 6)
             .fill(`rgba(128, 128, 128, ${alpha})`);
        }
        
        // Textos "FIRMA" y "SELLO" debajo de los cuadros
        doc.fillColor('#666666').fontSize(10).font('Helvetica-Bold')
           .text('FIRMA', 50, newSignatureY + sigHeight + 10, { align: 'center', width: sigWidth })
           .text('SELLO', 50 + sigWidth + sigSpacing, newSignatureY + sigHeight + 10, { align: 'center', width: sigWidth });
        
        // Información del aprobador (si está disponible)
        if (ordenData.aprobador_nombre) {
          doc.fontSize(9).font('Helvetica').fillColor('#333333')
             .text(ordenData.aprobador_nombre, 50, newSignatureY + sigHeight + 30, { align: 'center', width: sigWidth });
          doc.fontSize(8).fillColor('#666666')
             .text(ordenData.aprobador_cargo || '', 50, newSignatureY + sigHeight + 45, { align: 'center', width: sigWidth })
             .text(`DNI: ${ordenData.aprobador_dni || 'N/A'}`, 50, newSignatureY + sigHeight + 58, { align: 'center', width: sigWidth });
        }
        
        // Footer en la nueva página
        const footerY = newSignatureY + sigHeight + 40;
        doc.fontSize(8).font('Helvetica')
           .fillColor('#7f8c8d')
           .text(`Documento generado el ${new Date().toLocaleString('es-PE')}`, 0, footerY, { align: 'center' })
           .text('Sistema de Órdenes de Compra - LADP', 0, footerY + 15, { align: 'center' });
      } else {
        // Los elementos caben en la página actual
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
        
        // Información del aprobador (si está disponible)
        if (ordenData.aprobador_nombre) {
          doc.fontSize(9).font('Helvetica').fillColor('#333333')
             .text(ordenData.aprobador_nombre, 50, signatureY + sigHeight + 30, { align: 'center', width: sigWidth });
          doc.fontSize(8).fillColor('#666666')
             .text(ordenData.aprobador_cargo || '', 50, signatureY + sigHeight + 45, { align: 'center', width: sigWidth })
             .text(`DNI: ${ordenData.aprobador_dni || 'N/A'}`, 50, signatureY + sigHeight + 58, { align: 'center', width: sigWidth });
        }
        
        // Footer
        const footerY = signatureY + sigHeight + 40;
        doc.fontSize(8).font('Helvetica')
           .fillColor('#7f8c8d')
           .text(`Documento generado el ${new Date().toLocaleString('es-PE')}`, 0, footerY, { align: 'center' })
           .text('Sistema de Órdenes de Compra - LADP', 0, footerY + 15, { align: 'center' });
      }

      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateOrderPdf };