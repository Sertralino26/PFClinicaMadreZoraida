import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLogs, limpiarLogs, NIVEL } from '../../utils/logger';

const ESTILO_NIVEL = {
  [NIVEL.ERROR]: { color: '#EF4444', bg: '#FEF2F2', icon: 'close-circle-outline', label: 'Error' },
  [NIVEL.ADVERTENCIA]: { color: '#F59E0B', bg: '#FFFBEB', icon: 'warning-outline', label: 'Advertencia' },
  [NIVEL.INFO]: { color: '#3B82F6', bg: '#EFF6FF', icon: 'information-circle-outline', label: 'Info' },
};

export default function AdminLogsScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState('todos');

  const cargar = async () => setLogs(await getLogs());
  useEffect(() => { cargar(); }, []);

  const logsFiltrados = filtro === 'todos' ? logs : logs.filter(l => l.nivel === filtro);

  const limpiar = () => {
    Alert.alert('Limpiar historial', '¿Eliminar todos los logs registrados?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await limpiarLogs(); cargar(); } }
    ]);
  };

  const filtros = [
    { key: 'todos', label: 'Todos' },
    { key: NIVEL.ERROR, label: 'Errores' },
    { key: NIVEL.ADVERTENCIA, label: 'Advertencias' },
  ];

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Logs ({logs.length})</Text>
        <TouchableOpacity onPress={limpiar} style={styles.limpiarBtn}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtrosRow}>
        {filtros.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filtroChip, filtro === f.key && styles.filtroChipActivo]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[styles.filtroText, filtro === f.key && styles.filtroTextActivo]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {logsFiltrados.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={50} color="#94A3B8" />
            <Text style={styles.emptyText}>No hay registros{filtro !== 'todos' ? ' en esta categoría' : ''}</Text>
          </View>
        ) : (
          logsFiltrados.map((log) => {
            const estilo = ESTILO_NIVEL[log.nivel] || ESTILO_NIVEL[NIVEL.INFO];
            return (
              <View key={log.id} style={[styles.card, { backgroundColor: estilo.bg }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Ionicons name={estilo.icon} size={18} color={estilo.color} />
                    <Text style={[styles.nivelText, { color: estilo.color }]}>{estilo.label}</Text>
                  </View>
                  <Text style={styles.fecha}>{log.fecha}</Text>
                </View>
                <Text style={styles.pantalla}>{log.pantalla}</Text>
                <Text style={styles.mensaje}>{log.mensaje}</Text>
                {log.detalle ? <Text style={styles.detalle}>Detalle: {log.detalle}</Text> : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#004AAD', flex: 1, marginLeft: 10 },
  limpiarBtn: { padding: 4 },
  filtrosRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filtroChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E2E8F0' },
  filtroChipActivo: { backgroundColor: '#004AAD', borderColor: '#004AAD' },
  filtroText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filtroTextActivo: { color: '#fff' },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#94A3B8', fontSize: 14, marginTop: 10 },
  card: { borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nivelText: { fontSize: 12, fontWeight: 'bold' },
  fecha: { fontSize: 11, color: '#94A3B8' },
  pantalla: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  mensaje: { fontSize: 13, color: '#1E293B' },
  detalle: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' },
});
