import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────
//  LOGGER CENTRALIZADO
//  Guarda un historial de errores en AsyncStorage para poder
//  revisarlos después (ej: desde el panel de Administrador).
// ─────────────────────────────────────────────────────────────

const CLAVE_LOGS = 'app_logs';
const MAX_LOGS = 100; // evita que el historial crezca indefinidamente

export const NIVEL = {
  ERROR: 'error',
  ADVERTENCIA: 'advertencia',
  INFO: 'info',
};

/**
 * Registra un evento en el historial de logs.
 * @param {string} pantalla - Dónde ocurrió (ej: "LoginScreen")
 * @param {string} mensaje - Descripción legible del evento/error
 * @param {string} nivel - NIVEL.ERROR | NIVEL.ADVERTENCIA | NIVEL.INFO
 * @param {object} detalle - Información técnica opcional (ej: error.message)
 */
export async function registrarLog(pantalla, mensaje, nivel = NIVEL.ERROR, detalle = null) {
  try {
    const logs = await getLogs();

    const nuevoLog = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 7),
      fecha: new Date().toLocaleString('es-PE'),
      pantalla,
      mensaje,
      nivel,
      detalle: detalle ? String(detalle) : null,
    };

    const actualizados = [nuevoLog, ...logs].slice(0, MAX_LOGS);
    await AsyncStorage.setItem(CLAVE_LOGS, JSON.stringify(actualizados));

    // También se imprime en consola, útil mientras se desarrolla con Metro.
    if (nivel === NIVEL.ERROR) {
      console.error(`[${pantalla}] ${mensaje}`, detalle || '');
    } else {
      console.warn(`[${pantalla}] ${mensaje}`, detalle || '');
    }
  } catch (e) {
    // Si ni siquiera el logger funciona, evitamos que la app se caiga por esto.
    console.error('No se pudo registrar el log:', e);
  }
}

export async function getLogs() {
  try {
    const j = await AsyncStorage.getItem(CLAVE_LOGS);
    return j ? JSON.parse(j) : [];
  } catch {
    return [];
  }
}

export async function limpiarLogs() {
  await AsyncStorage.removeItem(CLAVE_LOGS);
}
