import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert,
  ActivityIndicator, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getSesion, setSesion, getDoctoresExtra, saveDoctoresExtra,
  savePerfilDoctor, getPerfilDoctor, DOCTORES_SISTEMA } from '../../utils/storage';
import { registrarLog } from '../../utils/logger';

export default function DoctorPerfilScreen({ navigation }) {
  const [sesion, setSesionLocal] = useState(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [cmp, setCmp] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirmar, setPassConfirmar] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const s = await getSesion();
    setSesionLocal(s);
    if (s) {
      const perfilLocal = await getPerfilDoctor(s.correo);
      const datos = perfilLocal ? { ...s, ...perfilLocal } : s;
      setNombre(datos.nombre || '');
      setTelefono(datos.telefono || '');
      setEspecialidad(datos.especialidad || '');
      setCmp(datos.cmp || '');
      setEducation(datos.education || '');
      setExperience(datos.experience || '');
      setDescription(datos.description || '');
      setFotoPerfil(datos.fotoPerfil || null);
    }
  };

  const seleccionarFoto = async () => {
    Alert.alert('Foto de perfil', '¿Cómo quieres subir tu foto?', [
      { text: 'Cámara', onPress: () => abrirFuente('camera') },
      { text: 'Galería', onPress: () => abrirFuente('library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const abrirFuente = async (fuente) => {
    let permiso = fuente === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) { Alert.alert('Permiso denegado', 'Necesitas dar permiso para continuar'); return; }
    const result = fuente === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setFotoPerfil(result.assets[0].uri);
  };

  const guardar = async () => {
    if (!nombre.trim()) { Alert.alert('Error', 'El nombre no puede estar vacío'); return; }
    setGuardando(true);
    try {
      const actualizado = { ...sesion, nombre: nombre.trim(), telefono: telefono.trim(),
        especialidad: especialidad.trim(), cmp: cmp.trim(), education: education.trim(),
        experience: experience.trim(), description: description.trim(), fotoPerfil };
      await savePerfilDoctor(sesion.correo, actualizado);
      await setSesion(actualizado);
      setSesionLocal(actualizado);
      // Actualizar también en doctores_extra si es doctor creado por admin
      const extra = await getDoctoresExtra();
      if (extra[sesion.correo]) {
        extra[sesion.correo] = { ...extra[sesion.correo], ...actualizado };
        await saveDoctoresExtra(extra);
      }
      setEditando(false);
      Alert.alert('¡Éxito!', 'Perfil actualizado');
    } catch (e) {
      await registrarLog('DoctorPerfilScreen', `Error al guardar perfil de ${sesion?.correo}`, 'error', e.message);
      Alert.alert('Error', 'No se pudo guardar');
    }
    finally { setGuardando(false); }
  };

  const cambiarPassword = async () => {
    if (!passActual || !passNueva || !passConfirmar) { Alert.alert('Error', 'Completa todos los campos'); return; }
    if (passNueva.length < 6) { Alert.alert('Error', 'Mínimo 6 caracteres'); return; }
    if (passNueva !== passConfirmar) { Alert.alert('Error', 'Las contraseñas no coinciden'); return; }
    // Obtener password real (sistema o extra)
    const passwordBase = DOCTORES_SISTEMA[sesion.correo]?.password;
    const extra = await getDoctoresExtra();
    const passwordExtra = extra[sesion.correo]?.password;
    const passwordReal = passwordExtra || passwordBase;
    if (passActual !== passwordReal) { Alert.alert('Error', 'Contraseña actual incorrecta'); return; }
    // Guardar nueva contraseña
    if (extra[sesion.correo]) {
      extra[sesion.correo].password = passNueva;
      await saveDoctoresExtra(extra);
    } else {
      // Doctor de sistema: guardar en perfil local
      const perfilLocal = await getPerfilDoctor(sesion.correo) || {};
      await savePerfilDoctor(sesion.correo, { ...perfilLocal, passwordOverride: passNueva });
    }
    setPassActual(''); setPassNueva(''); setPassConfirmar('');
    setMostrarCambioPass(false);
    Alert.alert('¡Éxito!', 'Contraseña actualizada');
  };

  if (!sesion) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#004AAD" />;

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={editando ? guardar : () => setEditando(true)}>
          {guardando ? <ActivityIndicator size="small" color="#004AAD" /> :
            <Ionicons name={editando ? 'checkmark-outline' : 'create-outline'} size={24} color="#004AAD" />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar con cámara */}
        <View style={styles.avatarBox}>
          {fotoPerfil
            ? <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
            : <Image source={require('../../assets/placeholderdoctor.png')} style={styles.avatar} />}
          <TouchableOpacity style={styles.cambiarFotoBtn} onPress={seleccionarFoto}>
            <Ionicons name="camera-outline" size={16} color="white" />
            <Text style={styles.cambiarFotoText}> Cambiar foto</Text>
          </TouchableOpacity>
          <Text style={styles.rolTag}>👨‍⚕️ Doctor</Text>
        </View>

        {/* Información profesional */}
        <View style={styles.card}>
          <Text style={styles.seccion}>Información Profesional</Text>

          {[
            { label: 'Nombre Completo', val: nombre, set: setNombre, icon: 'person-outline' },
            { label: 'Especialidad', val: especialidad, set: setEspecialidad, icon: 'medical-outline' },
            { label: 'Código CMP', val: cmp, set: setCmp, icon: 'card-outline' },
            { label: 'Teléfono', val: telefono, set: setTelefono, icon: 'call-outline' },
          ].map((f, i) => (
            <View key={i} style={styles.grupo}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={[styles.inputBox, editando && styles.inputEditable]}>
                <Ionicons name={f.icon} size={18} color="#2B68B9" style={styles.icon} />
                <TextInput style={styles.input} value={f.val} onChangeText={f.set} editable={editando} />
              </View>
            </View>
          ))}

          <View style={styles.grupo}>
            <Text style={styles.label}>Correo</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color="#2B68B9" style={styles.icon} />
              <TextInput style={styles.input} value={sesion.correo} editable={false} />
            </View>
            <Text style={styles.helper}>El correo no se puede cambiar</Text>
          </View>

          {/* Campos académicos */}
          {[
            { label: 'Universidad', val: education, set: setEducation, icon: 'school-outline' },
            { label: 'Experiencia', val: experience, set: setExperience, icon: 'ribbon-outline' },
            { label: 'Descripción', val: description, set: setDescription, icon: 'document-text-outline' },
          ].map((f, i) => (
            <View key={i} style={styles.grupo}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={[styles.inputBoxMulti, editando && styles.inputEditable]}>
                <Ionicons name={f.icon} size={18} color="#2B68B9"
                  style={{ alignSelf: 'flex-start', marginTop: 4, marginRight: 10 }} />
                <TextInput style={[styles.input, { height: 'auto', textAlignVertical: 'top' }]}
                  value={f.val} onChangeText={f.set} editable={editando} multiline numberOfLines={3} />
              </View>
            </View>
          ))}

          {editando && (
            <TouchableOpacity style={styles.guardarBtn} onPress={guardar} disabled={guardando}>
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
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  scroll: { padding: 16, paddingBottom: 30 },
  avatarBox: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'white' },
  cambiarFotoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3A6DCE',
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14, marginTop: 10 },
  cambiarFotoText: { color: 'white', fontSize: 13, fontWeight: '600' },
  rolTag: { marginTop: 8, backgroundColor: '#DBEAFE', paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20, fontSize: 13, fontWeight: '700', color: '#1D4ED8' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 18, marginBottom: 16, elevation: 2 },
  seccionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seccion: { fontSize: 15, fontWeight: '700', color: '#004AAD', marginBottom: 12 },
  grupo: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: '#2B68B9', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 48 },
  inputBoxMulti: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 10, minHeight: 70 },
  inputEditable: { borderColor: '#3A6DCE', backgroundColor: '#fff' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1F2937', height: '100%' },
  helper: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  guardarBtn: { backgroundColor: '#3A6DCE', borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', marginTop: 6 },
  guardarBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});
