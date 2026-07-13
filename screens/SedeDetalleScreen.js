import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function SedeDetalleScreen({ navigation, route }) {
  const { sede } = route.params;

  const irALaSede = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${sede.latitude},${sede.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sede.nombre}</Text>
        <View style={{ width: 32 }} />
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: sede.latitude,
          longitude: sede.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: sede.latitude, longitude: sede.longitude }}
          title={sede.nombre}
          description={sede.direccion}
          pinColor="#004AAD"
        />
      </MapView>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <FontAwesome5 name="hospital" size={18} color="#2B68B9" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.nombre}>{sede.nombre}</Text>
            <Text style={styles.direccion}>{sede.direccion}</Text>
          </View>
        </View>
        {sede.telefono ? (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#2B68B9" style={{ marginRight: 10 }} />
            <Text style={styles.telefono}>{sede.telefono}</Text>
          </View>
        ) : null}
        {sede.distanciaKm != null ? (
          <View style={styles.infoRow}>
            <Ionicons name="navigate-outline" size={18} color="#2B68B9" style={{ marginRight: 10 }} />
            <Text style={styles.distancia}>{sede.distanciaKm.toFixed(1)} km de distancia</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.botonIr} onPress={irALaSede}>
          <Ionicons name="navigate" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.botonIrTexto}>Ir a la sede</Text>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#004AAD', flex: 1, textAlign: 'center' },
  map: { flex: 1 },
  infoCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, elevation: 10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A' },
  direccion: { fontSize: 13, color: '#64748B', marginTop: 2 },
  telefono: { fontSize: 14, color: '#334155' },
  distancia: { fontSize: 14, color: '#2B68B9', fontWeight: '600' },
  botonIr: {
    flexDirection: 'row', backgroundColor: '#004AAD', paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 3,
  },
  botonIrTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
