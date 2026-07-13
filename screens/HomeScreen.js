import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { registrarLog } from '../utils/logger';

export default function HomeScreen({ navigation }) {
  const [botonActivo, setBotonActivo] = useState('Inicio');
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');

  // Cargar el nombre real del usuario al entrar a Home
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const perfilJSON = await AsyncStorage.getItem('perfil_usuario');
        if (perfilJSON) {
          const perfil = JSON.parse(perfilJSON);
          const primerNombre = perfil.nombre?.split(' ')[0] || 'Usuario';
          setNombreUsuario(primerNombre);
        }
      } catch (error) {
        await registrarLog('HomeScreen', 'Error al cargar perfil de usuario', 'error', error.message);
      }
    };
    cargarPerfil();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.setItem('sesion_activa', 'false');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        }
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* CUSTOM TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#004AAD" />
        </TouchableOpacity>
        <Image source={require('../assets/logo.png')} style={styles.headerLogo} />
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={() => { setBotonActivo('Perfil'); navigation.navigate('UserProfile'); }}
        >
          <Ionicons name="person-circle-outline" size={32} color="#004AAD" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Saludo con nombre real */}
        <Text style={styles.saludo}>¡Hola, {nombreUsuario}! 👋</Text>
        <Text style={styles.subSaludo}>¿En qué podemos ayudarte hoy?</Text>

        {/* Card 1: Agendar Citas */}
        <TouchableOpacity
          style={[styles.largeCard, { backgroundColor: '#1E3A8A' }]}
          onPress={() => navigation.navigate('Appointment')}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardText}>Agendar{"\n"}citas</Text>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.cardIllustrationCircle}>
              <MaterialCommunityIcons name="calendar-check" size={32} color="#1E3A8A" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 2: Ver Doctores */}
        <TouchableOpacity
          style={[styles.largeCard, { backgroundColor: '#4ADE80' }]}
          onPress={() => navigation.navigate('Doctors')}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardText}>Ver{"\n"}Doctores</Text>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.cardIllustrationCircle}>
              <FontAwesome5 name="user-md" size={28} color="#4ADE80" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 3: Mis Citas */}
        <TouchableOpacity
          style={[styles.largeCard, { backgroundColor: '#F59E0B' }]}
          onPress={() => navigation.navigate('MyAppointments')}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardText}>Mis{"\n"}Citas</Text>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.cardIllustrationCircle}>
              <MaterialCommunityIcons name="calendar-clock" size={30} color="#F59E0B" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 4: Sedes Cercanas */}
        <TouchableOpacity
          style={[styles.largeCard, { backgroundColor: '#EF4444' }]}
          onPress={() => navigation.navigate('Sedes')}
        >
          <View style={styles.cardLeft}>
            <Text style={styles.cardText}>Sedes{"\n"}Cercanas</Text>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.cardIllustrationCircle}>
              <MaterialCommunityIcons name="map-marker-radius" size={30} color="#EF4444" />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER TAB BAR */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerItem, botonActivo === 'Inicio' && styles.footerItemActive]}
          onPress={() => setBotonActivo('Inicio')}
        >
          <Image source={require('../assets/house-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('MyAppointments')}
        >
          <Image source={require('../assets/calendar-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Citas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerItem, botonActivo === 'Perfil' && styles.footerItemActive]}
          onPress={() => { setBotonActivo('Perfil'); navigation.navigate('UserProfile'); }}
        >
          <Image source={require('../assets/circle-user-regular.png')} style={styles.iconPng} />
          <Text style={styles.footerText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#EAF4FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarButton: { padding: 5 },
  headerLogo: { width: 140, height: 40, resizeMode: 'contain' },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  saludo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004AAD',
    marginBottom: 4,
    textAlign: 'center',
  },
  subSaludo: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 28,
    textAlign: 'center',
  },
  largeCard: {
    flexDirection: 'row',
    width: '90%',
    height: 120,
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardLeft: { flex: 1, justifyContent: 'center' },
  cardText: { fontSize: 22, fontWeight: 'bold', color: 'white', lineHeight: 28 },
  cardRight: { justifyContent: 'center', alignItems: 'center' },
  cardIllustrationCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    backgroundColor: '#ffffff',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 10,
  },
  footerItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  footerItemActive: { backgroundColor: '#ACE9FF' },
  iconPng: { height: 24, width: 24 },
  footerText: { fontSize: 12, color: '#2B68B9', marginTop: 2, fontWeight: '600' },
});
