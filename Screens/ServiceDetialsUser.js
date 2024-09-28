import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const theme = {
  background: '#F0F5F9',
  text: '#171717',
  primary: '#DA0037',
  secondary: '#444444',
  accent: '#EDEDED',
};

const ServiceDetailsUser = ({ route }) => {
  const { service } = route.params;

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return 'N/A';
  };

  const DetailRow = ({ icon, label, value }) => (
    <View style={styles.row}>
      <View style={styles.iconLabelContainer}>
        <Icon name={icon} size={24} color={theme.primary} style={styles.icon} />
        <Text style={styles.label}>{label}:</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>{service.name}</Text>
        
        <DetailRow icon="cash" label="Price" value={`$${service.price}`} />
        {/* <DetailRow icon="account" label="Creator" value={service.creator} />
        <DetailRow icon="clock-outline" label="Created" value={formatDate(service.time)} />
        <DetailRow icon="update" label="Last Updated" value={formatDate(service.update)} /> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.background,
  },
  card: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    padding: 20,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: theme.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.secondary + '30',
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.text,
  },
  value: {
    fontSize: 16,
    color: theme.secondary,
    flex: 1,
    textAlign: 'right',
  },
});

export default ServiceDetailsUser;