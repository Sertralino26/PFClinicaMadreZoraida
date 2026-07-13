import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  KeyboardAvoidingView, ScrollView, Platform, ImageBackground, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login, setSesion } from '../utils/storage';
import { registrarLog } from '../utils/logger';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [cargando, setCargando] = useState(false);

  const validarCorreo = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async () => {
    if (!correo || !password) { Alert.alert('Error', 'Completa todos los campos'); return; }
    if (!validarCorreo(correo)) { Alert.alert('Error', 'Correo no válido'); return; }
    setCargando(true);
    try {
      const result = await login(correo, password);
      if (!result.ok) {
        await registrarLog('LoginScreen', `Login fallido para ${correo}: ${result.msg}`, 'advertencia');
        Alert.alert('Error', result.msg);
        return;
      }
      const u = result.usuario;
      await setSesion(u);
      // Redirigir según rol
      const destino = u.rol === 'admin' ? 'AdminHome' : u.rol === 'doctor' ? 'DoctorHome' : 'Home';
      navigation.reset({ index: 0, routes: [{ name: destino }] });
    } catch (e) {
      await registrarLog('LoginScreen', 'Excepción al iniciar sesión', 'error', e.message);
      Alert.alert('Error', 'Problema al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ImageBackground source={require('../assets/fondo.png')} style={styles.background} resizeMode="cover">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.titulo}>HOLA BIENVENIDO</Text>

          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.icon} />
            <TextInput placeholder="Correo electrónico" placeholderTextColor="#94A3B8"
              value={correo} onChangeText={setCorreo} keyboardType="email-address"
              autoCapitalize="none" style={styles.input} />
          </View>

          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.icon} />
            <TextInput placeholder="Contraseña" placeholderTextColor="#94A3B8"
              value={password} onChangeText={setPassword} secureTextEntry={!mostrar}
              autoCapitalize="none" style={styles.input} />
            <TouchableOpacity onPress={() => setMostrar(!mostrar)}>
              <Ionicons name={mostrar ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} style={[styles.btn, cargando && styles.btnOff]} disabled={cargando}>
            <Text style={styles.btnText}>{cargando ? 'Verificando...' : 'Iniciar Sesión'}</Text>
          </TouchableOpacity>

          <Image source={require('../assets/doctores.png')} style={styles.illustration} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 18 + insets.bottom }]}>
          <Text style={styles.footerText}>
            ¿No tienes cuenta?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>Registrarse</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  scroll: { alignItems: 'center', paddingHorizontal: 25, paddingTop: 80, paddingBottom: 100 },
  logo: { width: 220, height: 140, resizeMode: 'contain', marginTop: 10 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#004AAD', marginTop: 10, marginBottom: 40, letterSpacing: 0.5 },
  inputBox: { flexDirection: 'row', alignItems: 'center', width: '85%', backgroundColor: 'white',
    borderRadius: 30, marginBottom: 20, paddingHorizontal: 20, height: 50, borderWidth: 1,
    borderColor: '#E2E8F0', elevation: 2 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 15, height: '100%' },
  forgot: { alignSelf: 'flex-end', marginRight: '7.5%', marginTop: -10, marginBottom: 20 },
  forgotText: { color: '#3A6DCE', fontSize: 13, fontWeight: '600' },
  btn: { width: '85%', backgroundColor: '#3A6DCE', height: 50, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', elevation: 4 },
  btnOff: { backgroundColor: '#93B4E8' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  illustration: { width: 320, height: 250, resizeMode: 'contain', marginTop: 25 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white',
    paddingVertical: 18, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  footerText: { color: '#64748B', fontSize: 15 },
  footerLink: { color: '#3A6DCE', fontWeight: 'bold' },
});
