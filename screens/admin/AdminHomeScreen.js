import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { getCitas, getPacientes, getTodosDoctores, getTodosAdmins, cerrarSesion } from '../../utils/storage';

export default function AdminHomeScreen({ navigation }) {
  const [stats, setStats] = useState({ pacientes: 0, doctores: 0, citas: 0, pendientes: 0, admins: 0 });

  const cargar = async () => {
    const [pacientes, doctores, citas, admins] = await Promise.all([
      getPacientes(), getTodosDoctores(), getCitas(), getTodosAdmins(),
    ]);
    setStats({
      pacientes: Object.keys(pacientes).length,
      doctores: doctores.length,
      citas: citas.length,
      pendientes: citas.filter(c => c.estado === 'pendiente').length,
      admins: admins.length,
    });
  };

  useEffect(() => {
    cargar();
    const unsub = navigation.addListener('focus', cargar);
    return unsub;
  }, [navigation]);

  const logout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => {
        await cerrarSesion(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }}
    ]);
  };

  const opciones = useMemo(() => [
    { icon: 'people-outline', color: '#3A6DCE', label: 'Pacientes', sub: `${stats.pacientes} registrados`, route: 'AdminPacientes' },
    { icon: 'medical-outline', color: '#10B981', label: 'Doctores', sub: `${stats.doctores} activos`, route: 'AdminDoctores' },
    { icon: 'calendar-outline', color: '#F59E0B', label: 'Todas las Citas', sub: `${stats.citas} citas | ${stats.pendientes} pendientes`, route: 'AdminCitas' },
    { icon: 'shield-checkmark-outline', color: '#7C3AED', label: 'Administradores', sub: `${stats.admins} con acceso`, route: 'AdminAdministradores' },
    { icon: 'stats-chart-outline', color: '#0EA5E9', label: 'Estadísticas', sub: 'Ranking de doctores y reportes PDF', route: 'AdminEstadisticas' },
  ], [stats]);

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={{ flex: 1 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.rolBadge}>🛡️ Administrador</Text>
          <Text style={styles.titulo}>Panel de Control</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('AdminLogs')} style={styles.papeleraBtn}>
            <Ionicons name="document-text-outline" size={22} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AdminPapelera')} style={styles.papeleraBtn}>
            <Ionicons name="trash-bin-outline" size={22} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={26} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* STATS */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Pacientes', val: stats.pacientes, color: '#3A6DCE', icon: 'people-outline' },
            { label: 'Doctores', val: stats.doctores, color: '#10B981', icon: 'medical-outline' },
            { label: 'Citas Total', val: stats.citas, color: '#F59E0B', icon: 'calendar-outline' },
            { label: 'Pendientes', val: stats.pendientes, color: '#EF4444', icon: 'time-outline' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { borderLeftColor: s.color }]}>
              <Ionicons name={s.icon} size={22} color={s.color} />
              <Text style={[styles.statNum, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.seccionTitulo}>Gestión</Text>

        {opciones.map((op, i) => (
          <TouchableOpacity key={i} style={styles.opcionCard} onPress={() => navigation.navigate(op.route)}>
            <View style={[styles.opcionIcon, { backgroundColor: op.color + '20' }]}>
              <Ionicons name={op.icon} size={26} color={op.color} />
            </View>
            <View style={styles.opcionInfo}>
              <Text style={styles.opcionLabel}>{op.label}</Text>
              <Text style={styles.opcionSub}>{op.sub}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#1E3A8A' },
  rolBadge: { fontSize: 12, color: '#93C5FD', fontWeight: '700', marginBottom: 2 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  logoutBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 10 },
  papeleraBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 10 },
  scroll: { padding: 16, paddingBottom: 30 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '47%', backgroundColor: 'white', borderRadius: 14, padding: 14,
    alignItems: 'center', borderLeftWidth: 4, elevation: 2 },
  statNum: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  seccionTitulo: { fontSize: 16, fontWeight: '700', color: '#004AAD', marginBottom: 12 },
  opcionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  opcionIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  opcionInfo: { flex: 1 },
  opcionLabel: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  opcionSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
