import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getEliminadosSistemaDetalle, restaurarUsuarioSistema } from '../../utils/storage';

export default function AdminPapeleraScreen({ navigation }) {
  const [eliminados, setEliminados] = useState([]);

  const cargar = async () => setEliminados(await getEliminadosSistemaDetalle());
  useEffect(() => { cargar(); }, []);

  const restaurar = (correo, nombre) => {
    Alert.alert('Restaurar usuario', `¿Restaurar a "${nombre}"? Podrá iniciar sesión nuevamente.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restaurar', onPress: async () => {
        await restaurarUsuarioSistema(correo);
        cargar();
      }}
    ]);
  };

  return (
    <ImageBackground source={require('../../assets/fondo.png')} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Papelera del Sistema</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.descripcion}>
          Aquí aparecen los doctores o administradores originales del sistema que fueron
          eliminados. Puedes restaurarlos para que vuelvan a tener acceso.
        </Text>

        {eliminados.length === 0 ? (
          <View style={styles.empty}>
            <FontAwesome5 name="trash-restore" size={40} color="#94A3B8" />
            <Text style={styles.emptyText}>La papelera está vacía</Text>
          </View>
        ) : (
          eliminados.map((u, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.avatarBox}>
                  <FontAwesome5
                    name={u.rol === 'admin' ? 'user-shield' : 'user-md'}
                    size={20}
                    color="#94A3B8"
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.nombre}>{u.nombre}</Text>
                  <Text style={styles.correo}>{u.correo}</Text>
                  <Text style={styles.rol}>{u.rol === 'admin' ? 'Administrador' : 'Doctor'}</Text>
                </View>
                <TouchableOpacity style={styles.restaurarBtn} onPress={() => restaurar(u.correo, u.nombre)}>
                  <Ionicons name="refresh-outline" size={16} color="#10B981" />
                  <Text style={styles.restaurarText}>Restaurar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#004AAD' },
  scroll: { padding: 16, paddingBottom: 30 },
  descripcion: { fontSize: 13, color: '#64748B', marginBottom: 16, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { color: '#94A3B8', fontSize: 15, marginTop: 12 },
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 12, elevation: 2, opacity: 0.85 },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  avatarBox: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: 'bold', color: '#475569' },
  correo: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  rol: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontStyle: 'italic' },
  restaurarBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, gap: 4 },
  restaurarText: { color: '#10B981', fontSize: 12, fontWeight: '700' },
});
