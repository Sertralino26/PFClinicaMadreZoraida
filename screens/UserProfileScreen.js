import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageBackground, TextInput, Image, TouchableOpacity, StyleSheet, Text,
  View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getPacientes, savePacientes, getSesion, setSesion, cerrarSesion } from '../utils/storage';
import { registrarLog } from '../utils/logger';

export default function UserProfileScreen({ navigation }) {
  const [sesion, setSesionLocal] = useState(null);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirmar, setPassConfirmar] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    try {
      const s = await getSesion();
      setSesionLocal(s);
      if (s) {
        const pacientes = await getPacientes();
        const p = pacientes[s.correo] || s;
        setNombre(p.nombre || '');
        setTelefono(p.telefono || '');
        setCorreo(p.correo || '');
        setFotoPerfil(p.fotoPerfil || null);
      }
    } catch (e) {
      await registrarLog('UserProfileScreen', 'Error al cargar perfil', 'error', e.message);
    }
    finally { setCargando(false); }
  };

  const seleccionarFoto = async () => {
    Alert.alert('Foto de perfil', '¿Cómo quieres subir tu foto?', [
      { text: 'Cámara', onPress: () => abrirFuente('camera') },
      { text: 'Galería', onPress: () => abrirFuente('library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const abrirFuente = async (fuente) => {
    let permiso;
    if (fuente === 'camera') {
      permiso = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    if (!permiso.granted) { Alert.alert('Permiso denegado', 'Necesitas dar permiso para continuar'); return; }

    const result = fuente === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true, aspect: [1, 1], quality: 0.7 });

    if (!result.canceled && result.assets[0]) {
      setFotoPerfil(result.assets[0].uri);
    }
  };

  const guardarPerfil = async () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre no puede estar vacío'); return; }
    setGuardando(true);
    try {
      const pacientes = await getPacientes();
      if (pacientes[correo]) {
        pacientes[correo] = { ...pacientes[correo], nombre: nombre.trim(), telefono: telefono.trim(), fotoPerfil };
        await savePacientes(pacientes);
      }
      const sesionActualizada = { ...sesion, nombre: nombre.trim(), telefono: telefono.trim(), fotoPerfil };
      await setSesion(sesionActualizada);
      setSesionLocal(sesionActualizada);
      setEditando(false);
      Alert.alert('¡Éxito!', 'Perfil actualizado correctamente');
    } catch (e) {
      await registrarLog('UserProfileScreen', `Error al guardar perfil de ${correo}`, 'error', e.message);
      Alert.alert('Error', 'No se pudo guardar');
    }
    finally { setGuardando(false); }
  };

  const cambiarPassword = async () => {
    if (!passActual || !passNueva || !passConfirmar) { Alert.alert('Error', 'Completa todos los campos'); return; }
    if (passNueva.length < 6) { Alert.alert('Error', 'Mínimo 6 caracteres'); return; }
    if (passNueva !== passConfirmar) { Alert.alert('Error', 'Las contraseñas no coinciden'); return; }
    try {
      const pacientes = await getPacientes();
      if (!pacientes[correo]) { Alert.alert('Error', 'Usuario no encontrado'); return; }
      if (pacientes[correo].password !== passActual) { Alert.alert('Error', 'Contraseña actual incorrecta'); return; }
      pacientes[correo].password = passNueva;
      await savePacientes(pacientes);
      setPassActual(''); setPassNueva(''); setPassConfirmar('');
      setMostrarCambioPass(false);
      Alert.alert('¡Éxito!', 'Contraseña actualizada correctamente');
    } catch (e) {
      await registrarLog('UserProfileScreen', `Error al cambiar contraseña de ${correo}`, 'error', e.message);
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => {
        await cerrarSesion();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }}
    ]);
  };

  if (cargando) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EAF4FF' }}>
      <ActivityIndicator size="large" color="#004AAD" />
    </View>
  );

  return (
    <ImageBackground source={require('../assets/fondo.png')} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={editando ? guardarPerfil : () => setEditando(true)}>
          {guardando ? <ActivityIndicator size="small" color="#004AAD" /> :
            <Ionicons name={editando ? 'checkmark-outline' : 'create-outline'} size={24} color="#004AAD" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarBox}>
          {fotoPerfil
            ? <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
            : <Image source={require('../assets/placeholder_paciente.png')} style={styles.avatar} />}
          <TouchableOpacity style={styles.cambiarFotoBtn} onPress={seleccionarFoto}>
            <Ionicons name="camera-outline" size={16} color="white" />
            <Text style={styles.cambiarFotoText}> Cambiar foto</Text>
          </TouchableOpacity>
          <Text style={styles.rolTag}>👤 Paciente</Text>
        </View>

        {/* Datos personales */}
        <View style={styles.card}>
          <Text style={styles.seccion}>Información Personal</Text>

          <View style={styles.grupo}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={[styles.inputBox, editando && styles.inputEditable]}>
              <Ionicons name="person-outline" size={18} color="#2B68B9" style={styles.icon} />
              <TextInput style={styles.input} value={nombre} onChangeText={setNombre} editable={editando} />
            </View>
          </View>

          <View style={styles.grupo}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color="#2B68B9" style={styles.icon} />
              <TextInput style={styles.input} value={correo} editable={false} />
            </View>
            <Text style={styles.helper}>El correo no se puede cambiar</Text>
          </View>

          <View style={styles.grupo}>
            <Text style={styles.label}>Teléfono</Text>
            <View style={[styles.inputBox, editando && styles.inputEditable]}>
              <Ionicons name="call-outline" size={18} color="#2B68B9" style={styles.icon} />
              <TextInput style={styles.input} value={telefono} onChangeText={setTelefono}
                editable={editando} keyboardType="phone-pad" />
            </View>
          </View>

          {editando && (
            <TouchableOpacity style={styles.guardarBtn} onPress={guardarPerfil} disabled={guardando}>
              <Text style={styles.guardarBtnText}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cambiar contraseña */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.seccionHeader}
            onPress={() => setMostrarCambioPass(!mostrarCambioPass)}>
            <Text style={styles.seccion}>Cambiar Contraseña</Text>
            <Ionicons name={mostrarCambioPass ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={20} color="#2B68B9" />
          </TouchableOpacity>

          {mostrarCambioPass && (
            <>
              {[
                { ph: 'Contraseña actual', val: passActual, set: setPassActual },
                { ph: 'Nueva contraseña (mín. 6)', val: passNueva, set: setPassNueva },
                { ph: 'Confirmar nueva contraseña', val: passConfirmar, set: setPassConfirmar },
              ].map((f, i) => (
                <View key={i} style={[styles.inputBox, styles.inputEditable, { marginBottom: 12 }]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#2B68B9" style={styles.icon} />
                  <TextInput style={styles.input} placeholder={f.ph} placeholderTextColor="#94A3B8"
                    value={f.val} onChangeText={f.set} secureTextEntry={!mostrarPass} />
                </View>
              ))}
              <TouchableOpacity onPress={() => setMostrarPass(!mostrarPass)} style={{ marginBottom: 10 }}>
                <Text style={{ color: '#3A6DCE', fontSize: 13 }}>
                  {mostrarPass ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.guardarBtn} onPress={cambiarPassword}>
                <Text style={styles.guardarBtnText}>Actualizar contraseña</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Recuperar contraseña */}
        <TouchableOpacity style={styles.recuperarBtn}
          onPress={() => navigation.navigate('ForgotPassword')}>
          <Ionicons name="key-outline" size={18} color="#3A6DCE" style={{ marginRight: 8 }} />
          <Text style={styles.recuperarText}>Recuperar contraseña</Text>
        </TouchableOpacity>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/house-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('MyAppointments')}>
          <Image source={require('../assets/calendar-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerItem, { backgroundColor: '#ACE9FF' }]}>
          <Image source={require('../assets/circle-user-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  scroll: { alignItems: 'center', paddingTop: 15, paddingBottom: 20, paddingHorizontal: 20 },
  avatarBox: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'white' },
  cambiarFotoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3A6DCE',
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14, marginTop: 10 },
  cambiarFotoText: { color: 'white', fontSize: 13, fontWeight: '600' },
  rolTag: { marginTop: 8, backgroundColor: '#E0F2FE', paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20, fontSize: 13, fontWeight: '700', color: '#0369A1' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 18, width: '100%',
    elevation: 2, marginBottom: 14 },
  seccionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seccion: { fontSize: 15, fontWeight: '700', color: '#004AAD', marginBottom: 12 },
  grupo: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: '#2B68B9', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 48 },
  inputEditable: { borderColor: '#3A6DCE', backgroundColor: '#fff' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1F2937', height: '100%' },
  helper: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  guardarBtn: { backgroundColor: '#3A6DCE', borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', marginTop: 6 },
  guardarBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  recuperarBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EFF6FF', borderRadius: 12, paddingVertical: 14, width: '100%',
    marginBottom: 10, borderWidth: 1, borderColor: '#BFDBFE' },
  recuperarText: { color: '#3A6DCE', fontWeight: 'bold', fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEF2F2', borderRadius: 12, paddingVertical: 14, width: '100%',
    marginBottom: 16, borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 15 },
  footer: { width: '100%', backgroundColor: '#fff', height: 80, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, elevation: 10 },
  footerItem: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center', borderRadius: 12 },
  iconPng: { height: 24, width: 24 },
  footerText: { fontSize: 12, color: '#2B68B9', marginTop: 2, fontWeight: '600' },
});
