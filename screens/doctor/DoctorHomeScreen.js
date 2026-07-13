import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView,
  Alert, Image, Modal } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { getCitas, actualizarEstadoCita, getSesion, cerrarSesion } from '../../utils/storage';

export default function DoctorHomeScreen({ navigation }) {
  const [sesion, setSesion] = useState(null);
  const [citas, setCitas] = useState([]);
  const [tab, setTab] = useState('pendiente');
  const [citaDetalle, setCitaDetalle] = useState(null);

  const cargar = useCallback(async () => {
    const s = await getSesion();
    setSesion(s);
    const todas = await getCitas();
    setCitas(todas.filter(c => c.doctor === s?.nombre));
  }, []);

  useEffect(() => {
    cargar();
    const unsub = navigation.addListener('focus', cargar);
    return unsub;
  }, [navigation, cargar]);

  const cambiarEstado = useCallback((id, estado) => {
    Alert.alert('Actualizar cita', `¿Marcar como "${estado}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => {
        await actualizarEstadoCita(id, estado);
        setCitaDetalle(null);
        cargar();
      }}
    ]);
  }, [cargar]);

  const logout = useCallback(() => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => {
        await cerrarSesion();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }}
    ]);
  }, [navigation]);

  // useMemo: evita recalcular el filtro y los stats en cada render
  const citasFiltradas = useMemo(() => citas.filter(c => c.estado === tab), [citas, tab]);

  const stats = useMemo(() => ([
    { label: 'Pendientes', val: citas.filter(c => c.estado === 'pendiente').length, color: '#F59E0B' },
    { label: 'Confirmadas', val: citas.filter(c => c.estado === 'confirmada').length, color: '#10B981' },
    { label: 'Canceladas', val: citas.filter(c => c.estado === 'cancelada').length, color: '#EF4444' },
    { label: 'Total', val: citas.length, color: '#3A6DCE' },
  ]), [citas]);

  const colorEstado = useCallback((e) =>
    ({ pendiente: '#F59E0B', confirmada: '#10B981', cancelada: '#EF4444' }[e] || '#94A3B8'), []);

  const formatFecha = useCallback((f) => {
    try {
      const [d, m, a] = f.split('/');
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      const obj = new Date(+a, +m-1, +d);
      return `${dias[obj.getDay()]}, ${d} de ${meses[+m-1]} del ${a}`;
    } catch { return f; }
  }, []);

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={styles.bg}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rolBadge}>👨‍⚕️ Doctor</Text>
          <Text style={styles.nombre} numberOfLines={1}>{sesion?.nombre || 'Doctor'}</Text>
          <Text style={styles.especialidad}>{sesion?.especialidad || 'Especialista'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('DoctorPerfil')} style={styles.iconBtn}>
          <Ionicons name="person-circle-outline" size={32} color="#004AAD" />
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={styles.iconBtn}>
          <Ionicons name="log-out-outline" size={28} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={i} style={[styles.statCard, { borderTopColor: s.color }]}>
            <Text style={[styles.statNum, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {['pendiente','confirmada','cancelada'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab===t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab===t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase()+t.slice(1)}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {citasFiltradas.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>Sin citas {tab}s</Text>
          </View>
        ) : (
          citasFiltradas.map(cita => (
            <TouchableOpacity key={cita.id} style={styles.card} onPress={() => setCitaDetalle(cita)}>
              <View style={styles.cardRow}>
                <View style={styles.pacienteAvatar}>
                  <FontAwesome5 name="user" size={20} color="#3A6DCE" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.pacienteNombre}>{cita.pacienteNombre}</Text>
                  <Text style={styles.pacienteCorreo}>{cita.pacienteCorreo}</Text>
                  <Text style={styles.citaEsp}>🩺 {cita.specialty}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[styles.estadoBadge, { backgroundColor: colorEstado(cita.estado)+'20' }]}>
                    <Text style={[styles.estadoText, { color: colorEstado(cita.estado) }]}>
                      {cita.estado?.charAt(0).toUpperCase()+cita.estado?.slice(1)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={16} color="#94A3B8" />
                </View>
              </View>
              <View style={styles.cardDate}>
                <Ionicons name="time-outline" size={15} color="#0284C7" />
                <Text style={styles.cardDateText}> {formatFecha(cita.date)} · {cita.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerItem, styles.footerActive]}>
          <Image source={require('../../assets/house-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('DoctorPerfil')}>
          <Image source={require('../../assets/circle-user-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Mi Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DETALLE CITA */}
      <Modal visible={!!citaDetalle} animationType="slide" transparent onRequestClose={() => setCitaDetalle(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle de Cita</Text>
              <TouchableOpacity onPress={() => setCitaDetalle(null)}>
                <Ionicons name="close-outline" size={28} color="#64748B" />
              </TouchableOpacity>
            </View>

            {citaDetalle && (
              <>
                {/* Estado */}
                <View style={[styles.modalEstadoBadge, { backgroundColor: colorEstado(citaDetalle.estado)+'20', alignSelf: 'flex-start', marginBottom: 16 }]}>
                  <Text style={[styles.estadoText, { color: colorEstado(citaDetalle.estado), fontSize: 14 }]}>
                    ● {citaDetalle.estado?.charAt(0).toUpperCase()+citaDetalle.estado?.slice(1)}
                  </Text>
                </View>

                {/* Paciente */}
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleTitulo}>👤 Paciente</Text>
                  <Text style={styles.detalleValor}>{citaDetalle.pacienteNombre}</Text>
                  <Text style={styles.detalleSubValor}>{citaDetalle.pacienteCorreo}</Text>
                </View>

                {/* Cita */}
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleTitulo}>🩺 Especialidad</Text>
                  <Text style={styles.detalleValor}>{citaDetalle.specialty}</Text>
                </View>

                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleTitulo}>📅 Fecha y Hora</Text>
                  <Text style={styles.detalleValor}>{formatFecha(citaDetalle.date)}</Text>
                  <Text style={styles.detalleSubValor}>🕐 {citaDetalle.time}</Text>
                </View>

                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleTitulo}>🆔 ID de Cita</Text>
                  <Text style={[styles.detalleSubValor, { fontFamily: 'monospace' }]}>#{citaDetalle.id}</Text>
                </View>

                {/* Acciones solo para pendientes */}
                {citaDetalle.estado === 'pendiente' && (
                  <View style={styles.modalAcciones}>
                    <TouchableOpacity style={styles.btnConfirmar}
                      onPress={() => cambiarEstado(citaDetalle.id, 'confirmada')}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                      <Text style={styles.btnText}> Confirmar cita</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnCancelar}
                      onPress={() => cambiarEstado(citaDetalle.id, 'cancelada')}>
                      <Ionicons name="close-circle-outline" size={18} color="white" />
                      <Text style={styles.btnText}> Cancelar cita</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  rolBadge: { fontSize: 11, color: '#0369A1', fontWeight: '700', marginBottom: 2 },
  nombre: { fontSize: 17, fontWeight: 'bold', color: '#004AAD' },
  especialidad: { fontSize: 12, color: '#64748B' },
  iconBtn: { padding: 5, marginLeft: 8 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 10,
    alignItems: 'center', borderTopWidth: 3, elevation: 2 },
  statNum: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#64748B', marginTop: 2, textAlign: 'center' },
  tabs: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#E2E8F0',
    borderRadius: 12, padding: 4, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: 'white', elevation: 2 },
  tabText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  tabTextActive: { color: '#004AAD', fontWeight: '700' },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94A3B8', fontSize: 15, marginTop: 10 },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, elevation: 2, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  pacienteAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  pacienteNombre: { fontSize: 15, fontWeight: 'bold', color: '#1E3A8A' },
  pacienteCorreo: { fontSize: 12, color: '#64748B' },
  citaEsp: { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 2 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  estadoText: { fontSize: 11, fontWeight: '700' },
  cardDate: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF',
    paddingVertical: 8, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  cardDateText: { fontSize: 13, color: '#0284C7', fontWeight: '600' },
  footer: { width: '100%', backgroundColor: '#fff', height: 80, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, elevation: 10 },
  footerItem: { paddingVertical: 8, paddingHorizontal: 20, alignItems: 'center', borderRadius: 12 },
  footerActive: { backgroundColor: '#ACE9FF' },
  iconPng: { height: 24, width: 24 },
  footerText: { fontSize: 12, color: '#2B68B9', marginTop: 2, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  modalEstadoBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  detalleSeccion: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 10 },
  detalleTitulo: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 4 },
  detalleValor: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A' },
  detalleSubValor: { fontSize: 13, color: '#64748B', marginTop: 2 },
  modalAcciones: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnConfirmar: { flex: 1, flexDirection: 'row', backgroundColor: '#10B981', borderRadius: 12,
    paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  btnCancelar: { flex: 1, flexDirection: 'row', backgroundColor: '#EF4444', borderRadius: 12,
    paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});
