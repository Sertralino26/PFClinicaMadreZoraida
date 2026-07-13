import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { registrarLog } from './logger';

const ESTADO_LABEL = { pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada' };
const ESTADO_COLOR = { pendiente: '#F59E0B', confirmada: '#10B981', cancelada: '#EF4444' };

const estiloBase = `
  <style>
    * { font-family: Helvetica, Arial, sans-serif; box-sizing: border-box; }
    body { padding: 30px; color: #1E293B; }
    .header { display: flex; align-items: center; justify-content: space-between;
      border-bottom: 3px solid #004AAD; padding-bottom: 14px; margin-bottom: 24px; }
    .clinica { font-size: 22px; font-weight: bold; color: #004AAD; }
    .subtitulo { font-size: 12px; color: #64748B; margin-top: 2px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px;
      font-size: 12px; font-weight: bold; color: white; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #EAF4FF; color: #004AAD; text-align: left; padding: 10px; font-size: 12px; }
    td { padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
    .footer { margin-top: 40px; font-size: 11px; color: #94A3B8; text-align: center; }
  </style>
`;

const compartirPdf = async (html, nombreArchivo) => {
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: nombreArchivo });
  }
  return uri;
};

/**
 * Genera y comparte un PDF con el detalle de una cita agendada.
 */
export const generarPdfCita = async (cita) => {
  try {
    const html = `
      <html><head>${estiloBase}</head><body>
        <div class="header">
          <div>
            <div class="clinica">Clínica Madre Zoraida</div>
            <div class="subtitulo">Comprobante de cita médica</div>
          </div>
          <span class="badge" style="background:${ESTADO_COLOR[cita.estado] || '#64748B'}">
            ${ESTADO_LABEL[cita.estado] || cita.estado}
          </span>
        </div>

        <table>
          <tr><th>N° de cita</th><td>${cita.id}</td></tr>
          <tr><th>Paciente</th><td>${cita.pacienteNombre}</td></tr>
          <tr><th>Correo</th><td>${cita.pacienteCorreo}</td></tr>
          <tr><th>Doctor</th><td>${cita.doctor}</td></tr>
          <tr><th>Especialidad</th><td>${cita.specialty}</td></tr>
          <tr><th>Fecha</th><td>${cita.date}</td></tr>
          <tr><th>Hora</th><td>${cita.time}</td></tr>
        </table>

        <div class="footer">
          Generado el ${new Date().toLocaleString('es-PE')} · Clínica Madre Zoraida
        </div>
      </body></html>
    `;
    await compartirPdf(html, `Cita_${cita.id}.pdf`);
  } catch (e) {
    await registrarLog('reports', 'Error al generar PDF de cita', 'error', e.message);
    throw e;
  }
};

/**
 * Genera y comparte un PDF con el reporte general administrativo:
 * resumen de estadísticas + tabla completa de citas.
 */
export const generarPdfReporteAdmin = async ({ stats, rankingDoctores, citas }) => {
  try {
    const filas = citas.map(c => `
      <tr>
        <td>${c.pacienteNombre}</td>
        <td>${c.doctor}</td>
        <td>${c.specialty}</td>
        <td>${c.date} ${c.time}</td>
        <td><span class="badge" style="background:${ESTADO_COLOR[c.estado] || '#64748B'}">
          ${ESTADO_LABEL[c.estado] || c.estado}</span></td>
      </tr>
    `).join('');

    const filasRanking = rankingDoctores.map((d, i) => `
      <tr>
        <td>${i === 0 ? '🏆 ' : ''}${d.nombre}</td>
        <td>${d.total}</td>
      </tr>
    `).join('');

    const html = `
      <html><head>${estiloBase}</head><body>
        <div class="header">
          <div>
            <div class="clinica">Clínica Madre Zoraida</div>
            <div class="subtitulo">Reporte administrativo general</div>
          </div>
        </div>

        <h3 style="color:#004AAD;">Resumen</h3>
        <table>
          <tr><th>Pacientes</th><td>${stats.pacientes}</td></tr>
          <tr><th>Doctores</th><td>${stats.doctores}</td></tr>
          <tr><th>Citas totales</th><td>${stats.citas}</td></tr>
          <tr><th>Pendientes</th><td>${stats.pendientes}</td></tr>
          <tr><th>Confirmadas</th><td>${stats.confirmadas}</td></tr>
          <tr><th>Canceladas</th><td>${stats.canceladas}</td></tr>
        </table>

        <h3 style="color:#004AAD; margin-top:24px;">Ranking de doctores por N° de citas</h3>
        <table>
          <tr><th>Doctor</th><th>Citas</th></tr>
          ${filasRanking}
        </table>

        <h3 style="color:#004AAD; margin-top:24px;">Detalle de citas</h3>
        <table>
          <tr><th>Paciente</th><th>Doctor</th><th>Especialidad</th><th>Fecha / Hora</th><th>Estado</th></tr>
          ${filas}
        </table>

        <div class="footer">
          Generado el ${new Date().toLocaleString('es-PE')} · Clínica Madre Zoraida
        </div>
      </body></html>
    `;
    await compartirPdf(html, `Reporte_Clinica_${Date.now()}.pdf`);
  } catch (e) {
    await registrarLog('reports', 'Error al generar reporte PDF administrativo', 'error', e.message);
    throw e;
  }
};
