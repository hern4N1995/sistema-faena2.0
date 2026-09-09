/**
 * Utilidades para formatear fechas sin problemas de zona horaria
 * Evita que "2026-06-01" se interprete como UTC y se muestre como 2026-05-31 en zonas horarias antes de UTC
 */

/**
 * Convierte una fecha de la BD a formato de fecha local (DD-MM-YYYY)
 * CLAVE: Si viene con Z (UTC), convierte a zona local PRIMERO
 * @param {string|Date} dateInput - Fecha de la BD (ej: "2026-06-01" o "2026-06-01T00:00:00Z")
 * @param {string} locale - Código de localización (default: 'es-AR')
 * @returns {string} Fecha formateada (ej: "01-06-2026") o string vacío si no es válida
 */
export function formatDateFromDB(dateInput, locale = 'es-AR') {
  if (!dateInput) return '';
  
  try {
    let dateString = String(dateInput).trim();
    
    // Caso 1: Formato ISO con marca de hora (ej: "2026-06-01T00:00:00Z" o "2026-06-01T00:00:00")
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateString)) {
      // Parsear como Date - JavaScript lo interpreta como UTC si tiene Z
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Formatear usando componentes en zona LOCAL (toLocaleDateString ya hace esto)
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
    
    // Caso 2: Formato YYYY-MM-DD puro (sin hora, asumir local)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      // Crear fecha en zona local
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
    
    // Caso 3: Otro formato - intentar parsearlo como Date
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (e) {
    console.error('Error al formatear fecha:', e);
    return '';
  }
}

/**
 * Convierte una fecha de un input type="date" a formato para API
 * CRÍTICO: Las columnas DATE en PostgreSQL NO necesitan hora
 * Enviar solo YYYY-MM-DD para evitar interpretación como UTC
 * @param {string} dateString - String de fecha (ej: "2026-06-01")
 * @returns {string} Fecha en formato YYYY-MM-DD o null
 */
export function formatDateForAPI(dateString) {
  if (!dateString) return null;
  
  // Si ya es un input type="date" puro (YYYY-MM-DD), devolverlo tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;  // "2026-06-01" puro, sin hora
  }
  
  // Si tiene hora/timezone (ISO format), extraer SOLO la parte de fecha
  // Para columnas DATE en PostgreSQL, NO enviamos hora
  if (dateString.includes('T')) {
    return dateString.split('T')[0];  // "2026-06-01T12:34:56Z" → "2026-06-01"
  }
  
  // Fallback: devolver como está
  return dateString;
}

/**
 * Formatea una fecha para mostrar en resumen (ej: "01-06-2026")
 * @param {string|Date} dateInput - Fecha a formatear
 * @param {string} locale - Código de localización
 * @returns {string} Fecha formateada
 */
export function formatDateSummary(dateInput, locale = 'es-AR') {
  return formatDateFromDB(dateInput, locale);
}

/**
 * Obtiene solo la parte de fecha (YYYY-MM-DD) de un string que puede contener hora
 * @param {string} dateString - String de fecha con posible hora
 * @returns {string} Parte de fecha (YYYY-MM-DD) o string vacío
 */
export function extractDatePart(dateString) {
  if (!dateString) return '';
  const match = String(dateString).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

/**
 * Convierte una fecha de la BD al formato YYYY-MM-DD para usar en input type="date"
 * CLAVE: Si viene con Z (UTC), convierte a zona local PRIMERO
 * @param {string|Date} dateInput - Fecha de la BD (ej: "2026-06-01" o "2026-06-01T00:00:00Z")
 * @returns {string} Fecha en formato YYYY-MM-DD (fecha local) o string vacío si no es válida
 */
export function formatDateForInput(dateInput) {
  if (!dateInput) return '';
  
  try {
    let dateString = String(dateInput).trim();
    
    // Caso 1: Formato ISO con marca de hora (ej: "2026-06-01T00:00:00Z" o "2026-06-01T00:00:00")
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateString)) {
      // Parsear como Date (JavaScript lo interpreta como UTC si tiene Z)
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Extraer componentes en zona LOCAL (no UTC)
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      
      return `${yyyy}-${mm}-${dd}`;
    }
    
    // Caso 2: Formato YYYY-MM-DD puro (sin hora)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // Asumir que es fecha local, devolver tal cual
      return dateString;
    }
    
    // Caso 3: Formato DD/MM/YYYY o DD-MM-YYYY
    if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(dateString)) {
      const parts = dateString.split(/[\/-]/);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Caso 4: Otro formato - intentar parsearlo como Date
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    // Usar componentes locales
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    console.error('Error al formatear fecha para input:', e);
    return '';
  }
}
