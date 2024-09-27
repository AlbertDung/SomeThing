import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ServiceDetails = ({ route }) => {
  const { service } = route.params;

  // Hàm để định dạng thời gian
  const formatDate = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return 'N/A';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Service Details</Text>
        
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{service.name}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>${service.price}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Creator:</Text>
          <Text style={styles.value}>{service.creator}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>{formatDate(service.time)}</Text>
        </View>
        
        <View style={styles.row}>
          <Text style={styles.label}>Last Updated:</Text>
          <Text style={styles.value}>{formatDate(service.update)}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    width: 100,
  },
  value: {
    flex: 1,
  },
});

export default ServiceDetails;