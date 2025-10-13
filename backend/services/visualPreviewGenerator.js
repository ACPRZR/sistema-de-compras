const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class VisualPreviewGenerator {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generar HTML para la vista previa visual
   */
  generatePreviewHTML(ordenData, items, total) {
    const fechaEmision = new Date().toLocaleDateString('es-PE');
    const fechaRequerimiento = ordenData.fecha_requerimiento ? 
      new Date(ordenData.fecha_requerimiento).toLocaleDateString('es-PE') : 'No especificada';
    
    const tipoOCTexto = ordenData.tipo_oc_id === 2 ? 'ORDEN MARCO (BLANKET)' : 'ORDEN ESTÁNDAR';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vista Previa Orden de Compra</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .orden-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #e74c3c, #f39c12, #e74c3c);
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: #3498db;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        
        .empresa-nombre {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .empresa-info {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        .orden-titulo {
            background: #ecf0f1;
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #3498db;
        }
        
        .orden-titulo h1 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .orden-numero {
            background: #3498db;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-size: 18px;
            font-weight: bold;
        }
        
        .content {
            padding: 30px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #3498db;
        }
        
        .info-card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: bold;
            color: #34495e;
        }
        
        .info-value {
            color: #2c3e50;
        }
        
        .proveedor-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 4px solid #e74c3c;
        }
        
        .proveedor-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .proveedor-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .items-section {
            margin-bottom: 30px;
        }
        
        .items-section h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 18px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: #34495e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: bold;
        }
        
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .items-table tr:hover {
            background: #e8f4f8;
        }
        
        .total-section {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: right;
            margin-bottom: 30px;
        }
        
        .total-label {
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .total-amount {
            font-size: 32px;
            font-weight: bold;
        }
        
        .condiciones-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 4px solid #f39c12;
        }
        
        .condiciones-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .condiciones-list {
            list-style: none;
            padding: 0;
        }
        
        .condiciones-list li {
            padding: 5px 0;
            color: #34495e;
            position: relative;
            padding-left: 20px;
        }
        
        .condiciones-list li::before {
            content: '•';
            color: #f39c12;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        .firmas-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .firmas-section h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 16px;
            text-align: center;
        }
        
        .firmas-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }
        
        .firma-box {
            text-align: center;
        }
        
        .firma-line {
            height: 60px;
            border-bottom: 2px solid #bdc3c7;
            margin-bottom: 10px;
            position: relative;
        }
        
        .firma-line::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #bdc3c7, transparent);
        }
        
        .firma-label {
            color: #7f8c8d;
            font-size: 14px;
            font-weight: bold;
        }
        
        .firma-info {
            color: #34495e;
            font-size: 12px;
            margin-top: 5px;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        
        .footer-info {
            margin-bottom: 10px;
        }
        
        .footer-date {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="orden-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">LADP</div>
            <div class="empresa-nombre">Las Asambleas de Dios del Perú</div>
            <div class="empresa-info">
                R.U.C. N° 20144538570<br>
                Av. Colombia 325, San Isidro, Lima<br>
                Tel: 915359876 | Email: logistica@ladp.org.pe
            </div>
        </div>
        
        <!-- Título de la Orden -->
        <div class="orden-titulo">
            <h1>ORDEN DE COMPRA</h1>
            <div class="orden-numero">${ordenData.numero_oc || 'OC-2025-01-001'}</div>
        </div>
        
        <!-- Contenido -->
        <div class="content">
            <!-- Información de la Orden -->
            <div class="info-grid">
                <div class="info-card">
                    <h3>📋 Información de la Orden</h3>
                    <div class="info-item">
                        <span class="info-label">Tipo:</span>
                        <span class="info-value">${tipoOCTexto}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha Emisión:</span>
                        <span class="info-value">${fechaEmision}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Fecha Requerimiento:</span>
                        <span class="info-value">${fechaRequerimiento}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Categoría:</span>
                        <span class="info-value">${ordenData.categoria_nombre || 'No especificada'}</span>
                    </div>
                </div>
                
                <div class="info-card">
                    <h3>🏢 Datos del Proveedor</h3>
                    <div class="info-item">
                        <span class="info-label">Razón Social:</span>
                        <span class="info-value">${ordenData.proveedor_nombre || 'No especificado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">RUC:</span>
                        <span class="info-value">${ordenData.proveedor_ruc || 'No especificado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Contacto:</span>
                        <span class="info-value">${ordenData.proveedor_contacto || 'No especificado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">${ordenData.proveedor_telefono || 'No especificado'}</span>
                    </div>
                </div>
            </div>
            
            <!-- Items de la Orden -->
            <div class="items-section">
                <h3>📦 Detalle de Items Solicitados</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th>Unidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.descripcion || ''}</td>
                                <td>${item.cantidad ? item.cantidad.toFixed(2) : '0'}</td>
                                <td>${item.unidad || ''}</td>
                                <td>S/ ${item.precio ? item.precio.toFixed(2) : '0.00'}</td>
                                <td>S/ ${item.subtotal ? item.subtotal.toFixed(2) : '0.00'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Total -->
            <div class="total-section">
                <div class="total-label">TOTAL GENERAL</div>
                <div class="total-amount">S/ ${total.toFixed(2)}</div>
            </div>
            
            <!-- Condiciones Comerciales -->
            <div class="condiciones-section">
                <h3>📋 Condiciones Comerciales</h3>
                <ul class="condiciones-list">
                    <li>Condiciones de Pago: ${ordenData.condiciones_pago_nombre || 'Contado'}</li>
                    <li>Lugar de Entrega: ${ordenData.lugar_entrega || 'No especificado'}</li>
                    <li>Fecha de Requerimiento: ${fechaRequerimiento}</li>
                    <li>Validez de la orden: 30 días calendario</li>
                    <li>Los precios incluyen IGV</li>
                    <li>${ordenData.tipo_oc_id === 2 ? 'ORDEN MARCO: Válida para múltiples entregas' : 'ORDEN ESTÁNDAR: Entrega única'}</li>
                </ul>
            </div>
            
            <!-- Firmas -->
            <div class="firmas-section">
                <h3>✍️ Firmas y Aprobaciones</h3>
                <div class="firmas-grid">
                    <div class="firma-box">
                        <div class="firma-line"></div>
                        <div class="firma-label">FIRMA</div>
                        <div class="firma-info">
                            Álvaro Pérez Román<br>
                            Responsable de Logística<br>
                            Fecha: ${fechaEmision}
                        </div>
                    </div>
                    <div class="firma-box">
                        <div class="firma-line"></div>
                        <div class="firma-label">SELLO</div>
                        <div class="firma-info">
                            Supervisor Autorizado<br>
                            Departamento de Compras<br>
                            Fecha: ___________
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-info">
                ${EMPRESA_CONFIG.direccion} | Tel: ${EMPRESA_CONFIG.telefono} | Email: ${EMPRESA_CONFIG.email}
            </div>
            <div class="footer-date">
                Documento generado el ${new Date().toLocaleString('es-PE')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Capturar la vista previa como imagen
   */
  async capturePreviewAsImage(ordenData, items, total) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Configurar viewport para captura de alta calidad
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      });

      // Generar HTML
      const html = this.generatePreviewHTML(ordenData, items, total);
      
      // Cargar HTML
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Esperar un poco para que se renderice completamente
      await page.waitForTimeout(1000);
      
      // Capturar screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true,
        quality: 100
      });
      
      return screenshot;
      
    } finally {
      await browser.close();
    }
  }

  /**
   * Generar vista previa y guardar como archivo temporal
   */
  async generatePreviewFile(ordenData, items, total) {
    const imageBuffer = await this.capturePreviewAsImage(ordenData, items, total);
    const filename = `preview_${Date.now()}.png`;
    const filepath = path.join(this.tempDir, filename);
    
    fs.writeFileSync(filepath, imageBuffer);
    
    return {
      filepath,
      filename,
      buffer: imageBuffer
    };
  }
}

module.exports = new VisualPreviewGenerator();
