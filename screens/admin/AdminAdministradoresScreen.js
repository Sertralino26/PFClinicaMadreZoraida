import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput,
  ImageBackground, Modal } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getTodosAdmins, eliminarAdminExtra, crearAdminManual, DOCTORES_SISTEMA, getSesion, eliminarUsuarioSistema } from '../../utils/storage';

export default function AdminAdministradoresScreen({ navigation }) {
  const [admins, setAdmins] = useState([]);
  const [modal, setModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correoPropio, setCorreoPropio] = useState('');

  const cargar = async () => {
    setAdmins(await getTodosAdmins());
    const sesion = await getSesion();
    setCorreoPropio(sesion?.correo || '');
  };
  useEffect(() => { cargar(); }, []);

  const crearAdmin = async () => {
    if (!nombre || !correo || !password) {
      Alert.alert('Error', 'Completa nombre, correo y contraseña'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { Alert.alert('Error', 'Correo no válido'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Mínimo 6 caracteres'); return; }

    const resultado = await crearAdminManual({ nombre, correo, password, telefono });
    if (!resultado.ok) { Alert.alert('Error', resultado.msg); return; }

    setModal(false); setNombre(''); setCorreo(''); setPassword(''); setTelefono('');
    cargar();
    Alert.alert('✅ Administrador creado', `Correo: ${correo.trim().toLowerCase()}\nContraseña: ${password}`);
  };

  const eliminarAdmin = (correo, nombre) => {
    if (correo === correoPropio) { Alert.alert('Aviso', 'No puedes eliminar tu propia cuenta'); return; }
    Alert.alert('Eliminar administrador', `¿Eliminar a "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        if (DOCTORES_SISTEMA[correo]) {
          await eliminarUsuarioSistema(correo);
        } else {
          await eliminarAdminExtra(correo);
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
        <Text style={styles.headerTitle}>Administradores ({admins.length})</Text>
        <TouchableOpacity onPress={() => setModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {admins.map((a, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.avatarBox}>
                <FontAwesome5 name="user-shield" size={20} color="#7C3AED" />
              </View>
              <View style={styles.info}>
                <Text style={styles.nombre}>{a.nombre}</Text>
                <Text style={styles.correo}>{a.correo}</Text>
                {a.telefono ? <Text style={styles.telefono}>📞 {a.telefono}</Text> : null}
              </View>
              <View style={{ alignItems: 'center', gap: 6 }}>
                {DOCTORES_SISTEMA[a.correo] && (
                  <View style={styles.sistemaBadge}><Text style={styles.sistemaText}>Sistema</Text></View>
                )}
                {a.correo === correoPropio ? (
                  <View style={styles.tuCuentaBadge}><Text style={styles.tuCuentaText}>Tú</Text></View>
                ) : (
                  <TouchableOpacity onPress={() => eliminarAdmin(a.correo, a.nombre)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Administrador</Text>
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
            <TouchableOpacity style={styles.crearBtn} onPress={crearAdmin}>
              <Text style={styles.crearBtnText}>Crear Administrador</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#004AAD' },
  addBtn: { backgroundColor: '#7C3AED', borderRadius: 10, padding: 6 },
  scroll: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  avatarBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F5F3FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: 'bold', color: '#1E3A8A' },
  correo: { fontSize: 11, color: '#64748B', marginTop: 1 },
  telefono: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  sistemaBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  sistemaText: { fontSize: 10, color: '#3A6DCE', fontWeight: '700' },
  tuCuentaBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  tuCuentaText: { fontSize: 10, color: '#D97706', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 48, marginBottom: 12 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  crearBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  crearBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
