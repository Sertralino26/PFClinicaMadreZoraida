import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput,
  ImageBackground, Modal, Image } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getTodosDoctores, getDoctoresExtra, saveDoctoresExtra, DOCTORES_SISTEMA, eliminarUsuarioSistema } from '../../utils/storage';

export default function AdminDoctoresScreen({ navigation }) {
  const [doctores, setDoctores] = useState([]);
  const [modal, setModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [telefono, setTelefono] = useState('');

  const cargar = async () => setDoctores(await getTodosDoctores());
  useEffect(() => { cargar(); }, []);

  const crearDoctor = async () => {
    if (!nombre || !correo || !password || !especialidad) {
      Alert.alert('Error', 'Completa nombre, correo, contraseña y especialidad'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { Alert.alert('Error', 'Correo no válido'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Mínimo 6 caracteres'); return; }
    const cn = correo.trim().toLowerCase();
    if (DOCTORES_SISTEMA[cn]) { Alert.alert('Error', 'Ya existe un doctor del sistema con ese correo'); return; }
    const extra = await getDoctoresExtra();
    if (extra[cn]) { Alert.alert('Error', 'Ya existe un doctor con ese correo'); return; }
    extra[cn] = { correo: cn, password, rol: 'doctor', nombre: nombre.trim(),
      especialidad: especialidad.trim(), telefono: telefono.trim(), fotoPerfil: null,
      cmp: '', education: '', experience: '', description: '' };
    await saveDoctoresExtra(extra);
    setModal(false); setNombre(''); setCorreo(''); setPassword(''); setEspecialidad(''); setTelefono('');
    cargar();
    Alert.alert('✅ Doctor creado', `Correo: ${cn}\nContraseña: ${password}`);
  };

  const eliminarDoctor = async (correo, nombre) => {
    Alert.alert('Eliminar doctor', `¿Eliminar a "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        if (DOCTORES_SISTEMA[correo]) {
          // Doctor del sistema (hardcodeado): se registra como eliminado.
          await eliminarUsuarioSistema(correo);
        } else {
          // Doctor creado desde la app.
          const extra = await getDoctoresExtra();
          delete extra[correo];
          await saveDoctoresExtra(extra);
        }
        cargar();
      }}
    ]);
  };

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctores ({doctores.length})</Text>
        <TouchableOpacity onPress={() => setModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {doctores.map((d, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.avatarBox}>
                {d.fotoPerfil
                  ? <Image source={{ uri: d.fotoPerfil }} style={styles.avatarImg} />
                  : <FontAwesome5 name="user-md" size={22} color="#10B981" />}
              </View>
              <View style={styles.info}>
                <Text style={styles.nombre}>{d.nombre}</Text>
                <Text style={styles.correo}>{d.correo}</Text>
                <Text style={styles.especialidad}>🩺 {d.especialidad || 'Medicina General'}</Text>
                {d.cmp ? <Text style={styles.cmp}>CMP: {d.cmp}</Text> : null}
              </View>
              <View style={{ alignItems: 'center', gap: 6 }}>
                {DOCTORES_SISTEMA[d.correo] && (
                  <View style={styles.sistemaBadge}><Text style={styles.sistemaText}>Sistema</Text></View>
                )}
                <TouchableOpacity onPress={() => eliminarDoctor(d.correo, d.nombre)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Doctor</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close-outline" size={26} color="#64748B" />
              </TouchableOpacity>
            </View>
            {[
              { ph: 'Nombre completo *', val: nombre, set: setNombre, icon: 'person-outline' },
              { ph: 'Correo electrónico *', val: correo, set: setCorreo, icon: 'mail-outline', kb: 'email-address' },
              { ph: 'Contraseña (mín. 6) *', val: password, set: setPassword, icon: 'lock-closed-outline', secure: true },
              { ph: 'Especialidad *', val: especialidad, set: setEspecialidad, icon: 'medical-outline' },
              { ph: 'Teléfono', val: telefono, set: setTelefono, icon: 'call-outline', kb: 'phone-pad' },
            ].map((f, i) => (
              <View key={i} style={styles.inputBox}>
                <Ionicons name={f.icon} size={18} color="#2B68B9" style={{ marginRight: 8 }} />
                <TextInput placeholder={f.ph} placeholderTextColor="#94A3B8" value={f.val}
                  onChangeText={f.set} secureTextEntry={f.secure} keyboardType={f.kb || 'default'}
                  autoCapitalize="none" style={styles.input} />
              </View>
            ))}
            <TouchableOpacity style={styles.crearBtn} onPress={crearDoctor}>
              <Text style={styles.crearBtnText}>Crear Doctor</Text>
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
  scroll: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  avatarBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ECFDF5',
    justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: 'bold', color: '#1E3A8A' },
  correo: { fontSize: 11, color: '#64748B', marginTop: 1 },
  especialidad: { fontSize: 12, color: '#10B981', marginTop: 2, fontWeight: '600' },
  cmp: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  sistemaBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  sistemaText: { fontSize: 10, color: '#3A6DCE', fontWeight: '700' },
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
