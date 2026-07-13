import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ImageBackground } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getCitas, eliminarCita } from '../../utils/storage';

export default function AdminCitasScreen({ navigation }) {
  const [citas, setCitas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');

  const cargar = async () => { setCitas(await getCitas()); };
  useEffect(() => { cargar(); }, []);

  const eliminar = (id, nombre) => {
    Alert.alert('Eliminar cita', `¿Eliminar la cita de "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await eliminarCita(id); cargar(); } }
    ]);
  };

  const colorEstado = (e) => ({ pendiente: '#F59E0B', confirmada: '#10B981', cancelada: '#EF4444' }[e] || '#94A3B8');

  const filtradas = citas.filter(c => {
    const matchBusq = c.pacienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.doctor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.pacienteCorreo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todas' || c.estado === filtroEstado;
    return matchBusq && matchEstado;
  });

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Todas las Citas ({citas.length})</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput placeholder="Buscar paciente, doctor..." placeholderTextColor="#94A3B8"
          value={busqueda} onChangeText={setBusqueda} style={{ flex: 1, fontSize: 14, color: '#333' }} />
      </View>

      <View style={styles.filtros}>
        {['todas','pendiente','confirmada','cancelada'].map(f => (
          <TouchableOpacity key={f} style={[styles.filtroBtn, filtroEstado===f && styles.filtroBtnActive]}
            onPress={() => setFiltroEstado(f)}>
            <Text style={[styles.filtroText, filtroEstado===f && styles.filtroTextActive]}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filtradas.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>Sin citas encontradas</Text>
          </View>
        ) : (
          filtradas.map(c => (
            <View key={c.id} style={styles.card}>
              {/* Paciente */}
              <View style={styles.cardRow}>
                <View style={styles.avatar}>
                  <FontAwesome5 name="user" size={18} color="#3A6DCE" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.paciente}>{c.pacienteNombre}</Text>
                  <Text style={styles.correo}>{c.pacienteCorreo}</Text>
                </View>
                <View style={[styles.estadoBadge, { backgroundColor: colorEstado(c.estado)+'20' }]}>
                  <Text style={[styles.estadoText, { color: colorEstado(c.estado) }]}>
                    {c.estado?.charAt(0).toUpperCase()+c.estado?.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Doctor y fecha */}
              <View style={styles.detalle}>
                <View style={styles.detalleRow}>
                  <Ionicons name="person-outline" size={14} color="#64748B" />
                  <Text style={styles.detalleText}> {c.doctor} · {c.specialty}</Text>
                </View>
                <View style={styles.detalleRow}>
                  <Ionicons name="time-outline" size={14} color="#0284C7" />
                  <Text style={[styles.detalleText, { color: '#0284C7' }]}> {c.date} | {c.time}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => eliminar(c.id, c.pacienteNombre)} style={styles.deleteRow}>
                <Ionicons name="trash-outline" size={15} color="#EF4444" />
                <Text style={styles.deleteText}> Eliminar cita</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#004AAD' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin: 16,
    borderRadius: 12, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  filtroBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E2E8F0' },
  filtroBtnActive: { backgroundColor: '#3A6DCE' },
  filtroText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filtroTextActive: { color: 'white' },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94A3B8', fontSize: 15, marginTop: 12 },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, elevation: 2, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  paciente: { fontSize: 15, fontWeight: 'bold', color: '#1E3A8A' },
  correo: { fontSize: 11, color: '#64748B' },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  estadoText: { fontSize: 11, fontWeight: '700' },
  detalle: { paddingHorizontal: 14, paddingBottom: 10, gap: 4 },
  detalleRow: { flexDirection: 'row', alignItems: 'center' },
  detalleText: { fontSize: 13, color: '#64748B' },
  deleteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEF2F2', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#FECACA' },
  deleteText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
});
