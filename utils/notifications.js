import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────
//  CONFIGURACIÓN GLOBAL
//  Define cómo se debe comportar una notificación cuando la app
//  está abierta y en primer plano (foreground).
// ─────────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─────────────────────────────────────────────────────────────
//  PERMISOS
// ─────────────────────────────────────────────────────────────

/**
 * Solicita permiso de notificaciones al usuario.
 * Devuelve true si fue concedido.
 */
export async function solicitarPermisoNotificaciones() {
  const { status: actual } = await Notifications.getPermissionsAsync();
  if (actual === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();

  // En Android es obligatorio crear un "canal" para que las notificaciones se muestren bien.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificaciones de Clínica',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return status === 'granted';
}

// ─────────────────────────────────────────────────────────────
//  NOTIFICACIÓN INMEDIATA
// ─────────────────────────────────────────────────────────────

/**
 * Dispara una notificación inmediata (ej: al agendar una cita).
 */
export async function notificarInmediato(titulo, cuerpo, datos = {}) {
  const permisoOk = await solicitarPermisoNotificaciones();
  if (!permisoOk) return null;

  return Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: cuerpo, data: datos },
    trigger: null, // null = se dispara de inmediato
  });
}

// ─────────────────────────────────────────────────────────────
//  NOTIFICACIÓN PROGRAMADA (recordatorio de cita)
// ─────────────────────────────────────────────────────────────

/**
 * Convierte los strings "DD/MM/YYYY" y "HH:MM AM/PM" (formato usado
 * en AppointmentScreen) a un objeto Date real.
 */
export function parsearFechaHoraCita(dateStr, timeStr) {
  // dateStr: "25/06/2026"
  const [dia, mes, anio] = dateStr.split('/').map(Number);

  // timeStr: "03:30 PM"
  const [horaMin, sufijo] = timeStr.split(' ');
  let [horas, minutos] = horaMin.split(':').map(Number);
  if (sufijo === 'PM' && horas !== 12) horas += 12;
  if (sufijo === 'AM' && horas === 12) horas = 0;

  return new Date(anio, mes - 1, dia, horas, minutos, 0);
}

/**
 * Programa un recordatorio antes de la cita.
 * Si la fecha calculada ya pasó (o está muy próxima), no programa nada.
 */
export async function programarRecordatorioCita(cita, minutosAntes = 60) {
  const permisoOk = await solicitarPermisoNotificaciones();
  if (!permisoOk) return null;

  const fechaCita = parsearFechaHoraCita(cita.date, cita.time);
  const fechaRecordatorio = new Date(fechaCita.getTime() - minutosAntes * 60 * 1000);

  // Si la fecha de recordatorio ya pasó, no tiene sentido programarla.
  if (fechaRecordatorio.getTime() <= Date.now()) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de cita',
      body: `Tu cita con ${cita.doctor} es a las ${cita.time}. ¡No olvides asistir!`,
      data: { citaId: cita.id },
    },
    trigger: fechaRecordatorio,
  });
}

/**
 * Cancela un recordatorio previamente programado (ej: si la cita se elimina).
 */
export async function cancelarNotificacion(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
