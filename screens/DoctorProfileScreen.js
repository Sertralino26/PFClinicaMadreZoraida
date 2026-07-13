import React from 'react';
import { ImageBackground, TextInput, Image, TouchableOpacity, StyleSheet,
  Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorProfileScreen({ route, navigation }) {
  const doctor = route?.params?.doctor;
  if (!doctor) return null;

  return (
    <ImageBackground style={styles.container} source={require('../assets/fondo.png')}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil del Doctor</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {doctor.fotoPerfil
            ? <Image source={{ uri: doctor.fotoPerfil }} style={styles.fp} />
            : <Image source={require('../assets/placeholderdoctor.png')} style={styles.fp} />}
        </View>

        <View style={styles.formCard}>
          {[
            { label: 'Nombre Completo', value: doctor.nombre, icon: 'person-outline' },
            { label: 'Especialidad', value: doctor.especialidad, icon: 'medical-outline' },
            { label: 'Código CMP', value: doctor.cmp, icon: 'card-outline' },
            { label: 'Teléfono', value: doctor.telefono, icon: 'call-outline' },
          ].map((f, i) => f.value ? (
            <View key={i} style={styles.grupo}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name={f.icon} size={18} color="#2B68B9" style={styles.fieldIcon} />
                <TextInput style={styles.input} value={f.value} editable={false} />
              </View>
            </View>
          ) : null)}

          {doctor.education ? (
            <View style={styles.grupo}>
              <Text style={styles.label}>Universidad</Text>
              <View style={[styles.inputWrapper, { height: 'auto', minHeight: 48, paddingVertical: 10 }]}>
                <Ionicons name="school-outline" size={18} color="#2B68B9"
                  style={{ alignSelf: 'flex-start', marginTop: 2, marginRight: 10 }} />
                <TextInput style={[styles.input, { height: 'auto' }]} value={doctor.education}
                  editable={false} multiline />
              </View>
            </View>
          ) : null}

          {(doctor.experience || doctor.description) ? (
            <View style={styles.grupo}>
              <Text style={styles.label}>Experiencia y Descripción</Text>
              <View style={[styles.inputWrapper, { height: 'auto', minHeight: 80, paddingVertical: 10 }]}>
                <Ionicons name="ribbon-outline" size={18} color="#2B68B9"
                  style={{ alignSelf: 'flex-start', marginTop: 2, marginRight: 10 }} />
                <TextInput style={[styles.input, { height: 'auto', textAlignVertical: 'top' }]}
                  value={`${doctor.experience || ''}\n\n${doctor.description || ''}`.trim()}
                  editable={false} multiline />
              </View>
            </View>
          ) : null}
        </View>
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
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('UserProfile')}>
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
  avatarContainer: { marginVertical: 15, alignItems: 'center' },
  fp: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'white' },
  formCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '95%',
    elevation: 3, marginBottom: 20 },
  grupo: { width: '100%', marginBottom: 15 },
  label: { fontSize: 12, fontWeight: '700', color: '#2B68B9', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB',
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 48 },
  fieldIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1F2937', height: '100%' },
  footer: { width: '100%', backgroundColor: '#fff', height: 80, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, elevation: 10 },
  footerItem: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  iconPng: { height: 24, width: 24 },
  footerText: { fontSize: 12, color: '#2B68B9', marginTop: 2, fontWeight: '600' },
});
