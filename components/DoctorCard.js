import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DoctorCard = ({ doctor }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{doctor.name}</Text>
      <Text style={styles.specialty}>{doctor.specialty}</Text>
    </View>
  );
};

export default DoctorCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A5C7D',
  },

  specialty: {
    fontSize: 15,
    marginTop: 5,
    color: '#555',
  },
});