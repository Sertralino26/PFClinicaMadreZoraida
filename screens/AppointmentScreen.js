import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert,
  ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { agregarCita, getSesion, getTodosDoctores, guardarNotificationIdCita } from '../utils/storage';
import { notificarInmediato, programarRecordatorioCita } from '../utils/notifications';
import { generarPdfCita } from '../utils/reports';
import { registrarLog } from '../utils/logger';

export default function AppointmentScreen({ navigation }) {
  const [especialidades, setEspecialidades] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const [esSel, setEsSel] = useState('');
  const [docSel, setDocSel] = useState('');
  const [docFiltrar, setDocFiltrar] = useState([]);

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      // Doctores de la API
      const response = await axios.get(
        'https://gist.githubusercontent.com/NWSThings1Day2U/0ad33893af59eaaf7a3ab5876c1be8fd/raw/6431bf46a15507e86f3e22921051f604b7a25f91/doctores.json'
      );
      const apiDocs = response.data.map(d => ({
        id: String(d.id), doctor: d.nombre, label: d.nombre,
        value: d.nombre, especialidad: d.especialidad,
      }));

      // Doctores locales (sistema + creados por admin)
      const locales = await getTodosDoctores();
      const localDocs = locales.map((d, i) => ({
        id: `local_${i}`, doctor: d.nombre, label: d.nombre,
        value: d.nombre, especialidad: d.especialidad || 'Medicina General',
      }));

      const todos = [...apiDocs, ...localDocs];
      setDoctores(todos);
      const unicas = [...new Set(todos.map(d => d.especialidad))].map(e => ({ label: e, value: e }));
      setEspecialidades(unicas);
    } catch (e) {
      await registrarLog('AppointmentScreen', 'Error al cargar lista de doctores', 'error', e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      setEsSel(''); setDocSel(''); setFecha(''); setHora(''); setDocFiltrar([]);
    });
    return unsub;
  }, [navigation]);

  const manejoEspecialidad = useCallback((esp) => {
    setEsSel(esp); setDocSel('');
    setDocFiltrar(doctores.filter(d => d.especialidad === esp));
  }, [doctores]);

  const agregarCitaHandler = async () => {
    if (!esSel || !docSel || !fecha || !hora) {
      Alert.alert('Error', 'Completa todos los campos'); return;
    }
    try {
      const sesion = await getSesion();
      const nuevaCita = await agregarCita({
        pacienteCorreo: sesion?.correo || 'desconocido',
        pacienteNombre: sesion?.nombre || 'Paciente',
        doctor: docSel,
        specialty: esSel,
        date: fecha,
        time: hora,
      });

      // Notificación inmediata confirmando el registro de la cita.
      await notificarInmediato(
        '¡Cita agendada!',
        `Tu cita con ${docSel} quedó registrada para el ${fecha} a las ${hora}.`
      );

      // Recordatorio programado 1 hora antes de la cita (si la fecha lo permite).
      const notificationId = await programarRecordatorioCita(nuevaCita, 60);
      if (notificationId) {
        await guardarNotificationIdCita(nuevaCita.id, notificationId);
      }

      Alert.alert('¡Cita agendada!', 'Tu cita fue registrada con éxito.', [
        { text: 'Descargar PDF', onPress: () => generarPdfCita(nuevaCita) },
        { text: 'Ver mis citas', onPress: () => navigation.navigate('MyAppointments') }
      ]);
    } catch (e) {
      await registrarLog('AppointmentScreen', `Error al agendar cita con ${docSel}`, 'error', e.message);
      Alert.alert('Error', 'No se pudo agendar la cita');
    }
  };

  if (cargando) return (
    <View style={styles.cargando}>
      <ActivityIndicator size="large" color="#2B68B9" />
      <Text style={{ fontWeight: 'bold', color: '#2B68B9', marginTop: 10 }}>Cargando...</Text>
    </View>
  );

  return (
    <ImageBackground source={require('../assets/fondo.png')} style={styles.background} resizeMode="cover">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Cita</Text>
        <MaterialCommunityIcons name="calendar-check-outline" size={26} color="#004AAD" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.campo}>
            <Text style={styles.label}>Especialidad</Text>
            <Dropdown iconColor="#3A6DCE" style={styles.dropdown} placeholderStyle={styles.ph}
              selectedTextStyle={styles.txt} data={especialidades} labelField="label" valueField="value"
              placeholder="Seleccionar especialidad" value={esSel || null}
              onChange={item => manejoEspecialidad(item.value)} />
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Doctor</Text>
            {esSel ? (
              <Dropdown iconColor="#3A6DCE" style={styles.dropdown} placeholderStyle={styles.ph}
                selectedTextStyle={styles.txt} data={docFiltrar} labelField="doctor" valueField="doctor"
                placeholder="Seleccionar doctor" value={docSel || null}
                onChange={item => setDocSel(item.value)} />
            ) : (
              <View style={[styles.dropdown, { justifyContent: 'center' }]}>
                <Text style={[styles.ph, { color: '#7a7a7a' }]}>Primero elige especialidad</Text>
              </View>
            )}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity onPress={() => setMostrarFecha(true)} style={styles.inputData}>
              <TextInput placeholder="Selecciona fecha" placeholderTextColor="#8A8A8A"
                editable={false} value={fecha} style={styles.textInput} />
              <MaterialCommunityIcons name="calendar-clock-outline" size={22} color="#3A6DCE" />
            </TouchableOpacity>
            {mostrarFecha && (
              <DateTimePicker value={new Date()} mode="date" display="default" minimumDate={new Date()}
                onChange={(event, sel) => {
                  setMostrarFecha(false);
                  if (event.type !== 'dismissed' && sel) {
                    const d = String(sel.getDate()).padStart(2,'0');
                    const m = String(sel.getMonth()+1).padStart(2,'0');
                    setFecha(`${d}/${m}/${sel.getFullYear()}`);
                  }
                }} />
            )}
          </View>

          <View style={styles.campo}>
            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity onPress={() => setMostrarHora(true)} style={styles.inputData}>
              <TextInput placeholder="Selecciona hora" placeholderTextColor="#8A8A8A"
                editable={false} value={hora} style={styles.textInput} />
              <MaterialCommunityIcons name="clock-outline" size={22} color="#3A6DCE" />
            </TouchableOpacity>
            {mostrarHora && (
              <DateTimePicker value={new Date()} mode="time" display="default"
                onChange={(event, sel) => {
                  setMostrarHora(false);
                  if (event.type !== 'dismissed' && sel) {
                    const h = sel.getHours(); const m = String(sel.getMinutes()).padStart(2,'0');
                    const suf = h >= 12 ? 'PM' : 'AM'; const h12 = h%12 || 12;
                    setHora(`${String(h12).padStart(2,'0')}:${m} ${suf}`);
                  }
                }} />
            )}
          </View>

          <TouchableOpacity style={styles.btn} onPress={agregarCitaHandler}>
            <Text style={styles.btnText}>Confirmar Cita</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Home')}>
          <Image source={require('../assets/house-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('MyAppointments')}>
          <Image source={require('../assets/calendar-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('UserProfile')}>
          <Image source={require('../assets/circle-user-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  scroll: { paddingHorizontal: 25, paddingTop: 25, paddingBottom: 40 },
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF4FF' },
  campo: { marginBottom: 20 },
  label: { color: '#004AAD', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  dropdown: { height: 48, borderColor: '#E2E8F0', backgroundColor: 'white', borderWidth: 1,
    borderRadius: 12, paddingHorizontal: 15, elevation: 1 },
  ph: { fontSize: 15, color: '#8A8A8A' },
  txt: { fontSize: 15, color: '#333' },
  inputData: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'white', borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 15, elevation: 1 },
  textInput: { flex: 1, color: '#333', fontSize: 15 },
  btn: { width: '100%', backgroundColor: '#3A6DCE', height: 50, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginTop: 25, elevation: 4, marginBottom: 20 },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  footer: { width: '100%', backgroundColor: '#fff', height: 80, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, elevation: 10 },
  footerItem: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center', borderRadius: 12 },
  iconPng: { height: 24, width: 24 },
  footerText: { fontSize: 12, color: '#2B68B9', marginTop: 2, fontWeight: '600' },
});
