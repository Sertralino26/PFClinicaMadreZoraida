import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { getPacientes } from '../utils/storage';
import { registrarLog } from '../utils/logger';

export default function ForgotPasswordScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const validarCorreo = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleRecuperar = async () => {
    if (!correo.trim()) {
      Alert.alert('Error', 'Ingresa tu correo electrónico');
      return;
    }
    if (!validarCorreo(correo)) {
      Alert.alert('Error', 'Ingresa un correo válido');
      return;
    }

    const correoNorm = correo.trim().toLowerCase();
    setCargando(true);

    try {
      // Verificar que el correo esté registrado como paciente
      const pacientes = await getPacientes();
      if (!pacientes[correoNorm]) {
        Alert.alert('Error', 'Este correo no está registrado en el sistema');
        setCargando(false);
        return;
      }

      // Registrar el correo en Firebase Auth si no existe,
      // luego enviar el correo de recuperación
      // Firebase solo puede enviar reset a correos registrados en Auth,
      // por eso usamos una contraseña temporal para registrarlo si hace falta
      try {
        await sendPasswordResetEmail(auth, correoNorm);
      } catch (firebaseError) {
        if (firebaseError.code === 'auth/user-not-found') {
          // El correo no está en Firebase Auth todavía → lo registramos primero
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          const passTemp = pacientes[correoNorm].password;
          try {
            await createUserWithEmailAndPassword(auth, correoNorm, passTemp);
          } catch (createError) {
            // Si ya existe con otra contraseña, ignorar
          }
          await sendPasswordResetEmail(auth, correoNorm);
        } else {
          throw firebaseError;
        }
      }

      setEnviado(true);
    } catch (error) {
      await registrarLog('ForgotPasswordScreen', `Error al recuperar contraseña de ${correoNorm}`, 'error', `${error.code}: ${error.message}`);
      let msg = 'No se pudo enviar el correo. Intenta de nuevo.';
      if (error.code === 'auth/invalid-email') msg = 'Correo no válido';
      if (error.code === 'auth/too-many-requests') msg = 'Demasiados intentos. Espera unos minutos.';
      if (error.code === 'auth/network-request-failed') msg = 'Sin conexión a internet';
      Alert.alert('Error', msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Botón volver */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#1D4ED8" />
        </TouchableOpacity>

        <Image source={require('../assets/logo.png')} style={styles.logo} />

        {!enviado ? (
          <>
            {/* Ícono */}
            <View style={styles.iconCircle}>
              <Ionicons name="lock-open-outline" size={40} color="#2563EB" />
            </View>

            <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.descripcion}>
              Ingresa el correo con el que te registraste y te enviaremos un enlace para restablecer tu contraseña.
            </Text>

            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#7F9CF5" style={styles.icon} />
              <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#8A8A8A"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              onPress={handleRecuperar}
              style={[styles.btn, cargando && styles.btnOff]}
              disabled={cargando}
            >
              {cargando
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnText}>Enviar enlace de recuperación</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.volverLink}>
              <Text style={styles.volverText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* PANTALLA DE CONFIRMACIÓN */
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#10B981" />
            </View>
            <Text style={styles.successTitulo}>¡Correo enviado!</Text>
            <Text style={styles.successDesc}>
              Hemos enviado un enlace de recuperación a:
            </Text>
            <Text style={styles.correoResaltado}>{correo.trim().toLowerCase()}</Text>
            <Text style={styles.successDesc2}>
              Revisa tu bandeja de entrada (y la carpeta de spam por si acaso). El enlace expira en 1 hora.
            </Text>

            <TouchableOpacity
              style={styles.btn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.btnText}>Volver al inicio de sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setEnviado(false); setCorreo(''); }}
              style={styles.reenviarLink}
            >
              <Text style={styles.reenviarText}>¿No recibiste el correo? Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FF' },
  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', padding: 8, marginBottom: 10 },
  logo: { width: 180, height: 110, resizeMode: 'contain' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DBEAFE',
    justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1D4ED8', marginBottom: 12,
    textAlign: 'center', letterSpacing: 0.3 },
  descripcion: { width: '90%', textAlign: 'center', color: '#555', lineHeight: 22,
    fontSize: 14, marginBottom: 28 },
  inputBox: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: 'white',
    borderRadius: 14, paddingHorizontal: 16, height: 54, borderWidth: 1, borderColor: '#BFDBFE',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2, marginBottom: 20 },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 15, height: '100%' },
  btn: { width: '100%', backgroundColor: '#2563EB', height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', elevation: 4,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6 },
  btnOff: { backgroundColor: '#93B4E8' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.3 },
  volverLink: { marginTop: 20 },
  volverText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
  // Pantalla de éxito
  successBox: { alignItems: 'center', width: '100%', marginTop: 10 },
  successIcon: { marginBottom: 16 },
  successTitulo: { fontSize: 24, fontWeight: 'bold', color: '#059669', marginBottom: 12 },
  successDesc: { textAlign: 'center', color: '#555', fontSize: 14, lineHeight: 20 },
  correoResaltado: { fontSize: 15, fontWeight: 'bold', color: '#1D4ED8',
    backgroundColor: '#DBEAFE', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 10, marginVertical: 10 },
  successDesc2: { textAlign: 'center', color: '#64748B', fontSize: 13,
    lineHeight: 20, marginBottom: 28, width: '90%' },
  reenviarLink: { marginTop: 16 },
  reenviarText: { color: '#64748B', fontSize: 13, textDecorationLine: 'underline' },
});
