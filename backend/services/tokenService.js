const crypto = require('crypto');
const { pool } = require('../config/database');

/**
 * Servicio para gestionar tokens de aprobación
 * Genera tokens únicos de 64 caracteres para aprobar/rechazar órdenes
 */
class TokenService {
  /**
   * Genera un token aleatorio seguro
   * @returns {string} Token de 64 caracteres hexadecimales
   */
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Calcula fecha de expiración del token
   * @param {number} hours - Horas hasta la expiración (default: 48)
   * @returns {Date} Fecha de expiración
   */
  static getExpirationDate(hours = 48) {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hours);
    return expirationDate;
  }

  /**
   * Genera y guarda un token para una orden
   * @param {number} ordenId - ID de la orden
   * @param {number} expirationHours - Horas hasta expiración
   * @returns {Promise<string>} Token generado
   */
  static async generateTokenForOrden(ordenId, expirationHours = 48) {
    const token = this.generateToken();
    const expirationDate = this.getExpirationDate(expirationHours);

    await pool.query(
      `UPDATE ordenes_compra.ordenes_compra 
       SET token_aprobacion = $1,
           token_creado_fecha = CURRENT_TIMESTAMP,
           token_expira_fecha = $2,
           token_usado = FALSE
       WHERE id = $3`,
      [token, expirationDate, ordenId]
    );

    return token;
  }

  /**
   * Valida un token
   * @param {string} token - Token a validar
   * @returns {Promise<Object|null>} Datos de la orden o null si es inválido
   */
  static async validateToken(token) {
    if (!token || typeof token !== 'string' || token.length !== 64) {
      return null;
    }

    const result = await pool.query(
      `SELECT 
        oc.*,
        e.nombre as estado_nombre,
        e.codigo as estado_codigo,
        c.nombre as categoria_nombre,
        p.nombre as proveedor_nombre
       FROM ordenes_compra.ordenes_compra oc
       LEFT JOIN ordenes_compra.estados_orden e ON oc.estado_id = e.id
       LEFT JOIN ordenes_compra.categorias_compra c ON oc.categoria_id = c.id
       LEFT JOIN ordenes_compra.proveedores p ON oc.proveedor_id = p.id
       WHERE oc.token_aprobacion = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const orden = result.rows[0];

    // Validar si el token ya fue usado
    if (orden.token_usado) {
      return { ...orden, error: 'TOKEN_USADO', message: 'Este link ya fue utilizado' };
    }

    // Validar si el token expiró
    if (orden.token_expira_fecha && new Date(orden.token_expira_fecha) < new Date()) {
      return { ...orden, error: 'TOKEN_EXPIRADO', message: 'Este link ha expirado' };
    }

    // Validar si la orden ya fue procesada (aprobada, rechazada o completada)
    // Permitir estados: 1 (Creada) y 2 (En Revisión)
    if (orden.estado_id !== 1 && orden.estado_id !== 2) {
      return { ...orden, error: 'ORDEN_PROCESADA', message: 'Esta orden ya fue procesada' };
    }

    return orden;
  }

  /**
   * Marca un token como usado
   * @param {string} token - Token a marcar
   */
  static async markTokenAsUsed(token) {
    await pool.query(
      `UPDATE ordenes_compra.ordenes_compra 
       SET token_usado = TRUE 
       WHERE token_aprobacion = $1`,
      [token]
    );
  }

  /**
   * Invalida un token (marca como usado y elimina)
   * @param {number} ordenId - ID de la orden
   */
  static async invalidateToken(ordenId) {
    await pool.query(
      `UPDATE ordenes_compra.ordenes_compra 
       SET token_aprobacion = NULL,
           token_usado = TRUE 
       WHERE id = $1`,
      [ordenId]
    );
  }

  /**
   * Genera URLs completas para aprobar/rechazar
   * @param {string} token - Token
   * @param {string} baseUrl - URL base del sistema
   * @returns {Object} URLs de aprobar y rechazar
   */
  static generateUrls(token, baseUrl) {
    const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remover slash final si existe
    
    return {
      aprobar: `${cleanBaseUrl}/aprobar/${token}`,
      rechazar: `${cleanBaseUrl}/rechazar/${token}`
    };
  }

  /**
   * Genera mensaje de WhatsApp con formato
   * @param {Object} orden - Datos de la orden
   * @param {Object} urls - URLs de aprobación/rechazo
   * @returns {string} Mensaje formateado
   */
  static generateWhatsAppMessage(orden, urls) {
    return `🔔 *Nueva Orden de Compra*

📋 Orden: ${orden.numero_oc}
🏢 Proveedor: ${orden.proveedor_nombre || orden.proveedor_nombre}
💰 Total: S/ ${parseFloat(orden.total || 0).toFixed(2)}
📅 Fecha: ${new Date(orden.fecha_creacion).toLocaleDateString('es-PE')}

Por favor, revisa y autoriza:

✅ *Aprobar:*
${urls.aprobar}

❌ *Rechazar:*
${urls.rechazar}

⏰ _Este link expira en 12 horas_`;
  }
}

module.exports = TokenService;

