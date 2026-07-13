import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getTodosDoctores } from '../utils/storage';

const getSpecialtyColors = (s) => {
  const map = {
    'Medicina General': { bg: '#E0F2FE', text: '#0284C7' },
    'Cardiología':      { bg: '#FEE2E2', text: '#DC2626' },
    'Traumatología':    { bg: '#ECFDF5', text: '#059669' },
    'Gastroenterología':{ bg: '#F5F3FF', text: '#7C3AED' },
    'Ginecología':      { bg: '#FCE7F3', text: '#DB2777' },
    'Pediatría':        { bg: '#FEF3C7', text: '#D97706' },
    'Urología':         { bg: '#E0FFE4', text: '#16A34A' },
  };
  return map[s] || { bg: '#F3F4F6', text: '#4B5563' };
};

export default function DoctorsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [doctores, setDoctores] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const todos = await getTodosDoctores();
      setDoctores(todos);
      setCargando(false);
    };
    cargar();
    const unsub = navigation.addListener('focus', cargar);
    return unsub;
  }, [navigation]);

  const filtrados = doctores.filter(d =>
    d.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    d.especialidad?.toLowerCase().includes(search.toLowerCase())
  );

  const renderDoctor = ({ item }) => {
    const colors = getSpecialtyColors(item.especialidad);
    return (
      <TouchableOpacity style={styles.card}
        onPress={() => navigation.navigate('DoctorProfile', { doctor: item })}>
        <View style={styles.iconContainer}>
          {item.fotoPerfil
            ? <Image source={{ uri: item.fotoPerfil }} style={styles.fotoCard} />
            : <FontAwesome5 name="user-md" size={36} color="#2B68B9" />}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.nombre}</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{item.especialidad}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={26} color="#004AAD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuestros Doctores</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#7F9CF5" style={{ marginRight: 10 }} />
          <TextInput placeholder="Buscar doctor o especialidad..." placeholderTextColor="#8A8A8A"
            value={search} onChangeText={setSearch} style={styles.searchInput} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {cargando ? <ActivityIndicator size="large" color="#2B68B9" style={{ marginTop: 40 }} /> : (
          <FlatList data={filtrados} keyExtractor={(_, i) => String(i)} renderItem={renderDoctor}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="sad-outline" size={50} color="#94A3B8" />
                <Text style={styles.emptyText}>No se encontraron doctores</Text>
              </View>
            } />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: '#EAF4FF',
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004AAD' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 12, marginBottom: 20, paddingHorizontal: 15, height: 50, elevation: 2 },
  searchInput: { flex: 1, fontSize: 15, color: '#333', height: '100%' },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', elevation: 2 },
  iconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E0F2FE',
    justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' },
  fotoCard: { width: 56, height: 56, borderRadius: 28 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#1E3A8A' },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginTop: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#666', marginTop: 10 },
  footer: { width: '100%', backgroundColor: '#fff', height: 80, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-around', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, elevation: 10 },
  footerItem: { paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center' },
  iconPng: { height: 24, width: 24 },
  footerText: { fontSize: 12, color: '#2B68B9', marginTop: 2, fontWeight: '600' },
});
