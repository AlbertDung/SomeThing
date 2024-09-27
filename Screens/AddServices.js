import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../App'; // Assuming you have AuthContext

const AddService = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const { user } = useContext(AuthContext); // To get the current user

  const addService = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    try {
      // Get the latest service ID
      const servicesRef = collection(db, 'service');
      const q = query(servicesRef, orderBy('id', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      let newId = 1;
      if (!querySnapshot.empty) {
        const latestId = querySnapshot.docs[0].data().ID;
        newId = (typeof latestId === 'number' ? latestId : parseInt(latestId, 10)) + 1;
      }
  
      const currentTime = new Date();
      await addDoc(collection(db, 'service'), {
        ID: newId,
        name,
        price: parseFloat(price),
        creator: user.fullname, // Assuming user object has fullname
        time: currentTime,
        update: currentTime
      });
  
      Alert.alert('Success', 'Service added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding service: ', error);
      Alert.alert('Error', 'Failed to add service');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Service</Text>
      <TextInput
        style={styles.input}
        placeholder="Service Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={addService}>
        <Text style={styles.buttonText}>Add Service</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default AddService;