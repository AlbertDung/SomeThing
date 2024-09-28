import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const theme = {
  background: '#F0F5F9',
  text: '#171717',
  primary: '#DA0037',
  secondary: '#444444',
  accent: '#EDEDED',
};

const EditService = ({ route, navigation }) => {
  const { service } = route.params;
  const [name, setName] = useState(service.name || '');
  const [price, setPrice] = useState(service.price ? service.price.toString() : '');

  useEffect(() => {
    navigation.setOptions({ 
      title: `Edit ${service.name || 'Service'}`,
      headerRight: () => (
        <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
          <Icon name="check" size={24} color={theme.accent} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, service.name]);

  const handleUpdate = async () => {
    if (name.trim() === '' || price.trim() === '') {
      Alert.alert('Error', 'Name and price cannot be empty');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    try {
      if (!service.id) {
        throw new Error('Invalid service ID');
      }

      const serviceRef = doc(db, 'service', service.id);
      const updateData = {
        name: name.trim(),
        price: numericPrice,
        update: serverTimestamp()
      };

      await updateDoc(serviceRef, updateData);

      Alert.alert('Success', 'Service has been updated', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating service: ', error);
      Alert.alert('Error', `Unable to update service. Error: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Service Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter service name"
          placeholderTextColor={theme.secondary}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Price:</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          placeholderTextColor={theme.secondary}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.updateButtonLarge} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Update Service</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.background,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.accent,
  },
  updateButton: {
    marginRight: 16,
    padding: 8,
  },
  updateButtonLarge: {
    backgroundColor: theme.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditService;