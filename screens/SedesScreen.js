import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { SEDES } from '../data/sedes';
import { obtenerUbicacionActual, ordenarSedesPorCercania } from '../utils/location';
import { useAcelerometro } from '../utils/sensors';
import { registrarLog } from '../utils/logger';

export default function SedesScreen({ navigation }) {
  const [sedesOrdenadas, setSedesOrdenadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [errorPermiso, setErrorPermiso] = useState(false);
  const [yaBuscado, setYaBuscado] = useState(false);

  // Acelerómetro: solo activo mientras el usuario está en esta pantalla.
  const { enMovimiento } = useAcelerometro({ activo: true });

  const buscarSedeCercana = useCallback(async () => {
    setCargando(true);
    setErrorPermiso(false);
    try {
      const ubicacion = await obtenerUbicacionActual();
      const ordenadas = ordenarSedesPorCercania(ubicacion, SEDES);
      setSedesOrdenadas(ordenadas);
    } catch (error) {
      if (error.message === 'PERMISO_DENEGADO') {
        setErrorPermiso(true);
        await registrarLog('SedesScreen', 'Permiso de ubicación denegado', 'advertencia');
        Alert.alert(
          'Permiso de ubicación requerido',
          'Para mostrarte la sede más cercana necesitamos acceso a tu ubicación. Puedes habilitarlo desde los ajustes del dispositivo.'
        );
      } else {
        await registrarLog('SedesScreen', 'Error al obtener ubicación del usuario', 'error', error.message);
        Alert.alert('Error', 'No se pudo obtener tu ubicación. Intenta nuevamente.');
      }
    } finally {
      setCargando(false);
      setYaBuscado(true);
    }
  }, []);

  const verDetalleSede = (sede) => {
    navigation.navigate('SedeDetalle', { sede });
  };

  const renderSede = ({ item, index }) => (
    <TouchableOpacity style={styles.card} onPress={() => verDetalleSede(item)}>
      <View style={[styles.iconContainer, index === 0 && styles.iconContainerCercana]}>
        <FontAwesome5 name="hospital" size={24} color={index === 0 ? '#fff' : '#2B68B9'} />
      </View>
      <View style={styles.info}>
        <View style={styles.nombreRow}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          {index === 0 && (
            <View style={styles.badgeCercana}>
              <Text style={styles.badgeCercanaText}>Más cercana</Text>
            </View>
          )}
        </View>
        <Text style={styles.direccion}>{item.direccion}</Text>
        <Text style={styles.distancia}>{item.distanciaKm.toFixed(1)} km de distancia</Text>
      </View>
      <Ionicons name="navigate-outline" size={22} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sedes Cercanas</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {!yaBuscado && !cargando && (
          <View style={styles.estadoInicial}>
            <MaterialCommunityIcons name="map-marker-radius" size={70} color="#7F9CF5" />
            <Text style={styles.estadoInicialTexto}>
              Encuentra la sede de la clínica más cercana a tu ubicación actual
            </Text>
            <TouchableOpacity style={styles.botonBuscar} onPress={buscarSedeCercana}>
              <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.botonBuscarTexto}>Usar mi ubicación</Text>
            </TouchableOpacity>
          </View>
        )}

        {cargando && (
          <View style={styles.estadoInicial}>
            <ActivityIndicator size="large" color="#2B68B9" />
            <Text style={styles.estadoInicialTexto}>Obteniendo tu ubicación...</Text>
          </View>
        )}

        {yaBuscado && !cargando && sedesOrdenadas.length > 0 && (
          <>
            {enMovimiento && (
              <View style={styles.avisoMovimiento}>
                <Ionicons name="walk-outline" size={16} color="#D97706" />
                <Text style={styles.avisoMovimientoTexto}>
                  Detectamos movimiento. Las distancias se actualizan mejor estando quieto.
                </Text>
              </View>
            )}
            <FlatList
              data={sedesOrdenadas}
              keyExtractor={(item) => item.id}
              renderItem={renderSede}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity style={styles.botonActualizar} onPress={buscarSedeCercana}>
              <Ionicons name="refresh-outline" size={18} color="#2B68B9" />
              <Text style={styles.botonActualizarTexto}>Actualizar ubicación</Text>
            </TouchableOpacity>
          </>
        )}

        {errorPermiso && yaBuscado && !cargando && sedesOrdenadas.length === 0 && (
          <View style={styles.estadoInicial}>
            <Ionicons name="lock-closed-outline" size={60} color="#94A3B8" />
            <Text style={styles.estadoInicialTexto}>
              No tenemos acceso a tu ubicación. Habilítalo desde los ajustes del dispositivo
              para usar esta función.
            </Text>
          </View>
        )}
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4FF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  estadoInicial: { alignItems: 'center', marginTop: 50, paddingHorizontal: 10 },
  estadoInicialTexto: {
    fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 16, marginBottom: 24, lineHeight: 21,
  },
  botonBuscar: {
    flexDirection: 'row', backgroundColor: '#004AAD', paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 14, alignItems: 'center', elevation: 3,
  },
  botonBuscarTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  avisoMovimiento: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 10,
    padding: 10, marginBottom: 14,
  },
  avisoMovimientoTexto: { color: '#92400E', fontSize: 12, marginLeft: 8, flex: 1 },

  card: {
    backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 2,
  },
  iconContainer: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#E0F2FE',
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
  },
  iconContainerCercana: { backgroundColor: '#22C55E' },
  info: { flex: 1 },
  nombreRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  nombre: { fontSize: 15, fontWeight: 'bold', color: '#1E3A8A', marginRight: 8 },
  badgeCercana: { backgroundColor: '#DCFCE7', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  badgeCercanaText: { color: '#16A34A', fontSize: 10, fontWeight: 'bold' },
  direccion: { fontSize: 13, color: '#64748B', marginTop: 3 },
  distancia: { fontSize: 13, color: '#2B68B9', fontWeight: '600', marginTop: 4 },

  botonActualizar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, marginTop: 4,
  },
  botonActualizarTexto: { color: '#2B68B9', fontSize: 14, fontWeight: '600', marginLeft: 6 },

  footer: {
    width: '100%', backgroundColor: '#fff', height: 80, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, elevation: 10,
  },
  footerItem: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  iconPng: { height: 24, width: 24 },
  footerText: { fontSize: 12, color: '#2B68B9', marginTop: 2, fontWeight: '600' },
});
