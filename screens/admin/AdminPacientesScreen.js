import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ImageBackground, Modal } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getPacientes, savePacientes, getCitas, eliminarCita, crearPacienteManual } from '../../utils/storage';

export default function AdminPacientesScreen({ navigation }) {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  const cargar = async () => {
    const p = await getPacientes();
    setPacientes(Object.values(p));
  };

  useEffect(() => { cargar(); }, []);

  const crearPaciente = async () => {
    if (!nombre || !correo || !password) {
      Alert.alert('Error', 'Completa nombre, correo y contraseña'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { Alert.alert('Error', 'Correo no válido'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Mínimo 6 caracteres'); return; }

    const resultado = await crearPacienteManual({ nombre, correo, password, telefono });
    if (!resultado.ok) { Alert.alert('Error', resultado.msg); return; }

    setModal(false); setNombre(''); setCorreo(''); setPassword(''); setTelefono('');
    cargar();
    Alert.alert('✅ Paciente creado', `Correo: ${correo.trim().toLowerCase()}\nContraseña: ${password}`);
  };

  const eliminarPaciente = (correo, nombre) => {
    Alert.alert('Eliminar paciente', `¿Eliminar a "${nombre}"? También se eliminarán sus citas.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        const p = await getPacientes();
        delete p[correo];
        await savePacientes(p);
        // Eliminar sus citas
        const citas = await getCitas();
        const { saveCitas } = await import('../../utils/storage');
        // Re-importamos saveCitas por claridad
        const { getCitas: gc, saveCitas: sc } = require('../../utils/storage');
        const restantes = citas.filter(c => c.pacienteCorreo !== correo);
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('citas_global', JSON.stringify(restantes));
        cargar();
      }}
    ]);
  };

  const filtrados = pacientes.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pacientes ({pacientes.length})</Text>
        <TouchableOpacity onPress={() => setModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput placeholder="Buscar por nombre o correo..." placeholderTextColor="#94A3B8"
          value={busqueda} onChangeText={setBusqueda} style={{ flex: 1, fontSize: 14, color: '#333' }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {filtrados.length === 0 ? (
          <View style={styles.empty}>
            <FontAwesome5 name="user-slash" size={40} color="#94A3B8" />
            <Text style={styles.emptyText}>No hay pacientes registrados</Text>
          </View>
        ) : (
          filtrados.map((p, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.avatar}>
                  <FontAwesome5 name="user" size={22} color="#3A6DCE" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.nombre}>{p.nombre}</Text>
                  <Text style={styles.correo}>{p.correo}</Text>
                  <Text style={styles.meta}>📞 {p.telefono || 'Sin teléfono'} · Desde {p.fechaRegistro || 'N/A'}</Text>
                </View>
                <TouchableOpacity onPress={() => eliminarPaciente(p.correo, p.nombre)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              {/* Nota de privacidad: NO se muestra la contraseña */}
              <View style={styles.privacidadBadge}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
                <Text style={styles.privacidadText}> Contraseña protegida · No visible</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Paciente</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close-outline" size={26} color="#64748B" />
              </TouchableOpacity>
            </View>
            {[
              { ph: 'Nombre completo *', val: nombre, set: setNombre, icon: 'person-outline' },
              { ph: 'Correo electrónico *', val: correo, set: setCorreo, icon: 'mail-outline', kb: 'email-address' },
              { ph: 'Contraseña (mín. 6) *', val: password, set: setPassword, icon: 'lock-closed-outline', secure: true },
              { ph: 'Teléfono', val: telefono, set: setTelefono, icon: 'call-outline', kb: 'phone-pad' },
            ].map((f, i) => (
              <View key={i} style={styles.inputBox}>
                <Ionicons name={f.icon} size={18} color="#2B68B9" style={{ marginRight: 8 }} />
                <TextInput placeholder={f.ph} placeholderTextColor="#94A3B8" value={f.val}
                  onChangeText={f.set} secureTextEntry={f.secure} keyboardType={f.kb || 'default'}
                  autoCapitalize="none" style={styles.input} />
              </View>
            ))}
            <TouchableOpacity style={styles.crearBtn} onPress={crearPaciente}>
              <Text style={styles.crearBtnText}>Crear Paciente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  addBtn: { backgroundColor: '#10B981', borderRadius: 10, padding: 6 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin: 16,
    borderRadius: 12, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#94A3B8', fontSize: 15, marginTop: 12 },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, elevation: 2, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  nombre: { fontSize: 15, fontWeight: 'bold', color: '#1E3A8A' },
  correo: { fontSize: 12, color: '#64748B', marginTop: 2 },
  meta: { fontSize: 11, color: '#94A3B8', marginTop: 3 },
  deleteBtn: { padding: 8 },
  privacidadBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    paddingVertical: 7, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: '#D1FAE5' },
  privacidadText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 48, marginBottom: 12 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  crearBtn: { backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  crearBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
