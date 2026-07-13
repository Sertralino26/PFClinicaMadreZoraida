import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getCitas, eliminarCita, getSesion, guardarNotificationIdCita } from '../utils/storage';
import { cancelarNotificacion } from '../utils/notifications';
import { generarPdfCita } from '../utils/reports';

export default function MyAppointmentsScreen({ navigation }) {
  const [listaCitas, setListaCitas] = useState([]);
  const [sesion, setSesion] = useState(null);

  const cargar = useCallback(async () => {
    const s = await getSesion();
    setSesion(s);
    const todas = await getCitas();
    setListaCitas(todas.filter(c => c.pacienteCorreo === s?.correo));
  }, []);

  useEffect(() => {
    cargar();
    const unsub = navigation.addListener('focus', cargar);
    return unsub;
  }, [navigation, cargar]);

  const cancelarCita = useCallback((id) => {
    Alert.alert('Cancelar cita', '¿Deseas cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: async () => {
        const citaEliminada = await eliminarCita(id);
        if (citaEliminada?.notificationId) {
          await cancelarNotificacion(citaEliminada.notificationId);
        }
        cargar();
      }}
    ]);
  }, [cargar]);

  const cancelarRecordatorio = useCallback((cita) => {
    Alert.alert(
      'Cancelar recordatorio',
      'Se cancelará el aviso programado antes de esta cita. La cita seguirá agendada.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar aviso', onPress: async () => {
          await cancelarNotificacion(cita.notificationId);
          await guardarNotificationIdCita(cita.id, null);
          cargar();
        }}
      ]
    );
  }, [cargar]);

  // useMemo: solo recalcula la función de formateo si cambia el idioma del sistema
  const formatearFecha = useCallback((f) => {
    try {
      const [d, m, a] = f.split('/');
      const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const obj = new Date(+a, +m-1, +d);
      return `${dias[obj.getDay()]} ${d} ${meses[obj.getMonth()]} del ${a}`;
    } catch { return f; }
  }, []);

  const colorEstado = useMemo(() => ({
    pendiente: '#F59E0B', confirmada: '#10B981', cancelada: '#EF4444'
  }), []);

  // Componente de cada cita memoizado para evitar re-renders innecesarios
  const renderCita = useCallback(({ item: cita }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <FontAwesome5 name="user-md" size={24} color="#0284C7" />
        </View>
        <View style={styles.info}>
          <Text style={styles.doctorName}>{cita.doctor}</Text>
          <Text style={styles.specialty}>{cita.specialty}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: (colorEstado[cita.estado] || '#94A3B8') + '20' }]}>
            <Text style={[styles.estadoText, { color: colorEstado[cita.estado] || '#94A3B8' }]}>
              {cita.estado?.charAt(0).toUpperCase() + cita.estado?.slice(1)}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => generarPdfCita(cita)} style={styles.pdfBtn}>
          <Ionicons name="document-text-outline" size={20} color="#0284C7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => cancelarCita(cita.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.dateRow}>
        <Ionicons name="time-outline" size={16} color="#0284C7" />
        <Text style={styles.dateText}> {formatearFecha(cita.date)} | {cita.time}</Text>
      </View>
      {cita.notificationId && cita.estado !== 'cancelada' && (
        <View style={styles.recordatorioRow}>
          <View style={styles.recordatorioInfo}>
            <Ionicons name="notifications-outline" size={15} color="#7C3AED" />
            <Text style={styles.recordatorioText}>Recordatorio activo</Text>
          </View>
          <TouchableOpacity onPress={() => cancelarRecordatorio(cita)} style={styles.recordatorioBtn}>
            <Ionicons name="notifications-off-outline" size={14} color="#7C3AED" />
            <Text style={styles.recordatorioBtnText}>Cancelar aviso</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [cancelarCita, cancelarRecordatorio, colorEstado, formatearFecha]);

  const ListaVacia = useMemo(() => (
    <View style={styles.sinCitas}>
      <Ionicons name="calendar-outline" size={48} color="#64748B" />
      <Text style={styles.sinCitasText}>No tienes citas agendadas</Text>
      <TouchableOpacity style={styles.agendarBtn} onPress={() => navigation.navigate('Appointment')}>
        <Text style={styles.agendarBtnText}>+ Agendar cita</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  return (
    <ImageBackground source={require('../assets/fondo.png')} style={styles.background} resizeMode="cover">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Citas ({listaCitas.length})</Text>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={styles.avatarButton}>
          <Ionicons name="person-circle-outline" size={32} color="#004AAD" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listaCitas}
        keyExtractor={(item) => item.id}
        renderItem={renderCita}
        ListEmptyComponent={ListaVacia}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Mis Citas</Text>}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/house-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerItem, styles.footerActive]}>
          <Image source={require('../assets/calendar-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('UserProfile')}>
          <Image source={require('../assets/circle-user-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  avatarButton: { padding: 5 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#004AAD', marginBottom: 20 },
  sinCitas: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  sinCitasText: { fontSize: 16, color: '#64748B', marginTop: 10, fontWeight: '500' },
  agendarBtn: { backgroundColor: '#3A6DCE', borderRadius: 20, paddingHorizontal: 20,
    paddingVertical: 10, marginTop: 16 },
  agendarBtnText: { color: 'white', fontWeight: 'bold' },
  card: { backgroundColor: 'white', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0',
    elevation: 3, overflow: 'hidden', marginBottom: 15 },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0F2FE',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: 'bold', color: '#004AAD' },
  specialty: { fontSize: 13, color: '#64748B', marginTop: 2 },
  estadoBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, marginTop: 4 },
  estadoText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 8 },
  pdfBtn: { padding: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF',
    paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  dateText: { fontSize: 14, color: '#0284C7', fontWeight: 'bold' },
  recordatorioRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F3FF', paddingVertical: 8, paddingHorizontal: 16,
    borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  recordatorioInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recordatorioText: { fontSize: 12, color: '#7C3AED', fontWeight: '600' },
  recordatorioBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordatorioBtnText: { fontSize: 11, color: '#7C3AED', fontWeight: '700', textDecorationLine: 'underline' },
  footer: { width: '100%', backgroundColor: '#fff', height: 80, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, elevation: 10 },
  footerItem: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center', borderRadius: 12 },
  footerActive: { backgroundColor: '#ACE9FF' },
  iconPng: { height: 24, width: 24 },
  footerText: { fontSize: 12, color: '#2B68B9', marginTop: 2, fontWeight: '600' },
});
