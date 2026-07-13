import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getCitas, getPacientes, getTodosDoctores } from '../../utils/storage';
import { generarPdfReporteAdmin } from '../../utils/reports';

const COLOR_ESTADO = { pendiente: '#F59E0B', confirmada: '#10B981', cancelada: '#EF4444' };
const BARRA_COLORES = ['#3A6DCE', '#10B981', '#F59E0B', '#7C3AED', '#EF4444'];

export default function AdminEstadisticasScreen({ navigation }) {
  const [stats, setStats] = useState({ pacientes: 0, doctores: 0, citas: 0, pendientes: 0, confirmadas: 0, canceladas: 0 });
  const [rankingDoctores, setRankingDoctores] = useState([]);
  const [porEspecialidad, setPorEspecialidad] = useState([]);
  const [citas, setCitas] = useState([]);
  const [exportando, setExportando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const intervalRef = useRef(null);

  const cargar = useCallback(async () => {
    const [pacientes, doctores, todasCitas] = await Promise.all([
      getPacientes(), getTodosDoctores(), getCitas(),
    ]);

    const porDoctor = {};
    const porEsp = {};
    todasCitas.forEach(c => {
      porDoctor[c.doctor] = (porDoctor[c.doctor] || 0) + 1;
      porEsp[c.specialty] = (porEsp[c.specialty] || 0) + 1;
    });
    const ranking = Object.entries(porDoctor)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);
    const especialidades = Object.entries(porEsp)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);

    setStats({
      pacientes: Object.keys(pacientes).length,
      doctores: doctores.length,
      citas: todasCitas.length,
      pendientes: todasCitas.filter(c => c.estado === 'pendiente').length,
      confirmadas: todasCitas.filter(c => c.estado === 'confirmada').length,
      canceladas: todasCitas.filter(c => c.estado === 'cancelada').length,
    });
    setRankingDoctores(ranking);
    setPorEspecialidad(especialidades);
    setCitas(todasCitas);
    setUltimaActualizacion(new Date());
  }, []);

  // Se refresca al entrar a la pantalla y cada 4s mientras esté enfocada,
  // para simular actualización "en tiempo real" a medida que cambian las citas.
  useEffect(() => {
    const unsubFocus = navigation.addListener('focus', () => {
      cargar();
      intervalRef.current = setInterval(cargar, 4000);
    });
    const unsubBlur = navigation.addListener('blur', () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    });
    return () => {
      unsubFocus(); unsubBlur();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [navigation, cargar]);

  const exportarPdf = async () => {
    setExportando(true);
    try {
      await generarPdfReporteAdmin({ stats, rankingDoctores, citas });
    } catch {
      Alert.alert('Error', 'No se pudo generar el reporte PDF');
    } finally {
      setExportando(false);
    }
  };

  const maxDoctor = rankingDoctores[0]?.total || 1;
  const maxEsp = porEspecialidad[0]?.total || 1;
  const totalEstados = stats.pendientes + stats.confirmadas + stats.canceladas || 1;

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Estadísticas</Text>
          {ultimaActualizacion && (
            <Text style={styles.actualizado}>
              Actualizado {ultimaActualizacion.toLocaleTimeString('es-PE')}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons name="chart-box-outline" size={26} color="white" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* RESUMEN RÁPIDO */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Citas Total', val: stats.citas, color: '#3A6DCE', icon: 'calendar-outline' },
            { label: 'Pendientes', val: stats.pendientes, color: '#F59E0B', icon: 'time-outline' },
            { label: 'Confirmadas', val: stats.confirmadas, color: '#10B981', icon: 'checkmark-circle-outline' },
            { label: 'Canceladas', val: stats.canceladas, color: '#EF4444', icon: 'close-circle-outline' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { borderLeftColor: s.color }]}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statNum, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* RANKING DE DOCTORES */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>🏆 Doctor con más citas</Text>
          {rankingDoctores.length === 0 ? (
            <Text style={styles.sinDatos}>Aún no hay citas registradas</Text>
          ) : rankingDoctores.slice(0, 5).map((d, i) => (
            <View key={d.nombre} style={styles.filaBarra}>
              <Text style={styles.nombreBarra} numberOfLines={1}>
                {i === 0 ? '🏆 ' : `${i + 1}. `}{d.nombre}
              </Text>
              <View style={styles.barraFondo}>
                <View style={[styles.barraRelleno, {
                  width: `${(d.total / maxDoctor) * 100}%`,
                  backgroundColor: BARRA_COLORES[i % BARRA_COLORES.length],
                }]} />
              </View>
              <Text style={styles.totalBarra}>{d.total}</Text>
            </View>
          ))}
        </View>

        {/* CITAS POR ESTADO */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Citas por estado</Text>
          <View style={styles.barraApilada}>
            {['pendiente', 'confirmada', 'cancelada'].map(estado => {
              const val = stats[estado === 'pendiente' ? 'pendientes' : estado === 'confirmada' ? 'confirmadas' : 'canceladas'];
              const pct = (val / totalEstados) * 100;
              return pct > 0 ? (
                <View key={estado} style={{ width: `${pct}%`, backgroundColor: COLOR_ESTADO[estado] }} />
              ) : null;
            })}
          </View>
          <View style={styles.leyendaRow}>
            {['pendiente', 'confirmada', 'cancelada'].map(estado => (
              <View key={estado} style={styles.leyendaItem}>
                <View style={[styles.leyendaDot, { backgroundColor: COLOR_ESTADO[estado] }]} />
                <Text style={styles.leyendaText}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CITAS POR ESPECIALIDAD */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Citas por especialidad</Text>
          {porEspecialidad.length === 0 ? (
            <Text style={styles.sinDatos}>Aún no hay citas registradas</Text>
          ) : porEspecialidad.slice(0, 6).map((e, i) => (
            <View key={e.nombre} style={styles.filaBarra}>
              <Text style={styles.nombreBarra} numberOfLines={1}>{e.nombre}</Text>
              <View style={styles.barraFondo}>
                <View style={[styles.barraRelleno, {
                  width: `${(e.total / maxEsp) * 100}%`,
                  backgroundColor: BARRA_COLORES[i % BARRA_COLORES.length],
                }]} />
              </View>
              <Text style={styles.totalBarra}>{e.total}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={exportarPdf} disabled={exportando}>
          <Ionicons name="document-text-outline" size={20} color="white" />
          <Text style={styles.exportBtnText}>{exportando ? 'Generando...' : 'Exportar reporte PDF'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#1E3A8A' },
  backButton: { padding: 5 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  actualizado: { fontSize: 11, color: '#93C5FD', textAlign: 'center', marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', backgroundColor: 'white', borderRadius: 14, padding: 14,
    alignItems: 'center', borderLeftWidth: 4, elevation: 2 },
  statNum: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: '#004AAD', marginBottom: 14 },
  sinDatos: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },
  filaBarra: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  nombreBarra: { width: '32%', fontSize: 12, color: '#334155', fontWeight: '600' },
  barraFondo: { flex: 1, height: 14, backgroundColor: '#F1F5F9', borderRadius: 7, overflow: 'hidden' },
  barraRelleno: { height: '100%', borderRadius: 7 },
  totalBarra: { width: 24, fontSize: 12, color: '#334155', fontWeight: 'bold', textAlign: 'right' },
  barraApilada: { flexDirection: 'row', height: 22, borderRadius: 11, overflow: 'hidden', backgroundColor: '#F1F5F9' },
  leyendaRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot: { width: 10, height: 10, borderRadius: 5 },
  leyendaText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  exportBtn: { flexDirection: 'row', backgroundColor: '#004AAD', borderRadius: 14, padding: 16,
    alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 3, marginTop: 4 },
  exportBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});
