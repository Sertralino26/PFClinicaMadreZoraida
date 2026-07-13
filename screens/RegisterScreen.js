import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  KeyboardAvoidingView, ScrollView, Platform, ImageBackground, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { getPacientes, savePacientes } from '../utils/storage';
import { registrarLog } from '../utils/logger';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [mostrarC, setMostrarC] = useState(false);
  const [cargando, setCargando] = useState(false);

  const validarCorreo = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleRegister = async () => {
    if (!nombre || !correo || !telefono || !password || !confirmar) {
      Alert.alert('Error', 'Completa todos los campos'); return;
    }
    if (!validarCorreo(correo)) { Alert.alert('Error', 'Correo no válido'); return; }
    if (password.length < 6) { Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres'); return; }
    if (password !== confirmar) { Alert.alert('Error', 'Las contraseñas no coinciden'); return; }

    const correoNorm = correo.trim().toLowerCase();
    setCargando(true);

    try {
      // 1. Verificar que no exista ya en AsyncStorage
      const pacientes = await getPacientes();
      if (pacientes[correoNorm]) {
        Alert.alert('Error', 'Este correo ya está registrado');
        setCargando(false);
        return;
      }

      // 2. Registrar en Firebase Auth (para recuperación de contraseña)
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, correoNorm, password);
        await updateProfile(userCredential.user, { displayName: nombre.trim() });
      } catch (firebaseError) {
        // Si ya existe en Firebase pero no en AsyncStorage, continuar igual
        if (firebaseError.code !== 'auth/email-already-in-use') {
          await registrarLog('RegisterScreen', `Error de Firebase al registrar ${correoNorm}`, 'advertencia', firebaseError.code);
        }
      }

      // 3. Guardar en AsyncStorage local
      pacientes[correoNorm] = {
        correo: correoNorm,
        password,
        rol: 'paciente',
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        fotoPerfil: null,
        historialMedico: [],
        notificaciones: [],
        fechaRegistro: new Date().toLocaleDateString('es-PE'),
      };
      await savePacientes(pacientes);

      Alert.alert('¡Cuenta creada!', 'Tu cuenta fue registrada exitosamente.', [
        { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (e) {
      await registrarLog('RegisterScreen', `Excepción al registrar ${correoNorm}`, 'error', e.message);
      Alert.alert('Error', 'No se pudo registrar. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ImageBackground source={require('../assets/fondo.png')} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back-outline" size={24} color="#004AAD" />
          </TouchableOpacity>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.titulo}>CREAR CUENTA</Text>
          <Text style={styles.badge}>👤 Registro de Paciente</Text>

          {[
            { icon: 'person-outline', ph: 'Nombre completo', val: nombre, set: setNombre },
            { icon: 'mail-outline', ph: 'Correo electrónico', val: correo, set: setCorreo, kb: 'email-address' },
            { icon: 'call-outline', ph: 'Teléfono', val: telefono, set: setTelefono, kb: 'phone-pad' },
          ].map((f, i) => (
            <View key={i} style={styles.inputBox}>
              <Ionicons name={f.icon} size={20} color="#94A3B8" style={styles.icon} />
              <TextInput placeholder={f.ph} placeholderTextColor="#94A3B8" value={f.val}
                onChangeText={f.set} keyboardType={f.kb || 'default'} autoCapitalize="none" style={styles.input} />
            </View>
          ))}

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.icon} />
            <TextInput placeholder="Contraseña (mín. 6 caracteres)" placeholderTextColor="#94A3B8"
              value={password} onChangeText={setPassword} secureTextEntry={!mostrar}
              autoCapitalize="none" style={styles.input} />
            <TouchableOpacity onPress={() => setMostrar(!mostrar)}>
              <Ionicons name={mostrar ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.icon} />
            <TextInput placeholder="Confirmar contraseña" placeholderTextColor="#94A3B8"
              value={confirmar} onChangeText={setConfirmar} secureTextEntry={!mostrarC}
              autoCapitalize="none" style={styles.input} />
            <TouchableOpacity onPress={() => setMostrarC(!mostrarC)}>
              <Ionicons name={mostrarC ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleRegister}
            style={[styles.btn, cargando && { backgroundColor: '#93B4E8' }]} disabled={cargando}>
            <Text style={styles.btnText}>{cargando ? 'Creando cuenta...' : 'Crear Cuenta'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 18 }}>
            <Text style={{ color: '#64748B', fontSize: 14 }}>
              ¿Ya tienes cuenta? <Text style={{ color: '#3A6DCE', fontWeight: 'bold' }}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>

          <Image source={require('../assets/doctores2.png')} style={styles.illustration} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  scroll: { alignItems: 'center', paddingHorizontal: 25, paddingTop: 50, paddingBottom: 20 },
  back: { alignSelf: 'flex-start', padding: 5, marginBottom: 10 },
  logo: { width: 180, height: 110, resizeMode: 'contain', marginTop: 5 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#004AAD', marginTop: 10, marginBottom: 6, letterSpacing: 0.5 },
  badge: { backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: 13, fontWeight: '600',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 20 },
  inputBox: { flexDirection: 'row', alignItems: 'center', width: '85%', backgroundColor: 'white',
    borderRadius: 30, marginBottom: 15, paddingHorizontal: 20, height: 50,
    borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 15, height: '100%' },
  btn: { width: '85%', backgroundColor: '#3A6DCE', height: 50, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginTop: 15, elevation: 4 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  illustration: { width: 300, height: 200, resizeMode: 'contain', marginTop: 20 },
});
