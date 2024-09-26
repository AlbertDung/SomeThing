import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AddEmployeeForm({ onAddEmployee ,darkMode }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [nextID, setNextID] = useState(1);

  useEffect(() => {
    // Fetch the highest ID from Firestore
    const fetchHighestID = async () => {
      const employeesRef = collection(db, 'employees');
      const snapshot = await getDocs(employeesRef);
      let maxID = 0;
      snapshot.forEach((doc) => {
        const employeeData = doc.data();
        if (employeeData.ID > maxID) {
          maxID = employeeData.ID;
        }
      });
      setNextID(maxID + 1);
    };
    fetchHighestID();
  }, []);

  const isValidInput = (input) => {
    // Check for special characters, only spaces, or code snippets
    const regex = /^[a-zA-Z0-9\s]+$/;
    return regex.test(input) && input.trim().length > 0;
  };

  const isEmailUnique = async (email) => {
    const employeesRef = collection(db, 'employees');
    const q = query(employeesRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleSubmit = async () => {
    if (!isValidInput(name) || !isValidInput(age)) {
      alert('Invalid input. Please use only letters, numbers, and spaces.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const ageValue = parseInt(age, 10);
    if (isNaN(ageValue) || ageValue < 18 || ageValue > 100) {
      alert('Please enter a valid age between 18 and 100');
      return;
    }

    if (!(await isEmailUnique(email.trim()))) {
      alert('This email is already in use');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'employees'), {
        ID: nextID,
        name: name.trim(),
        email: email.trim(),
        age: ageValue,
      });
      
      const newEmployee = {
        id: docRef.id,
        ID: nextID,
        name: name.trim(),
        email: email.trim(),
        age: ageValue,
      };
      
      onAddEmployee(newEmployee);
      setNextID(nextID + 1);
      setName('');
      setEmail('');
      setAge('');
    } catch (error) {
      console.error('Error adding employee: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Name"
        value={name}
        onChangeText={setName}
        containerStyle={[styles.input, darkMode && styles.darkInput]}
        inputStyle={darkMode && styles.darkText}
        plac ceholderTextColor={darkMode ? "#999999" : "#666666"}
      />
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        containerStyle={[styles.input, darkMode && styles.darkInput]}
        inputStyle={darkMode && styles.darkText}
        placceholderTextColor={darkMode ? "#999999" : "#666666"}
      />
      <Input
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        containerStyle={[styles.input, darkMode && styles.darkInput]}
        inputStyle={darkMode && styles.darkText}
        placceholderTextColor={darkMode ? "#999999" : "#666666"}
      />
      <Button
        title="Add Employee"
        onPress={handleSubmit}
        buttonStyle={[styles.button, darkMode && styles.darkButton]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  darkInput: {
    borderColor: '#333333',
    backgroundColor: '#333333',
  },
  darkText: {
    color: '#FFFFFF',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  darkButton: {
    backgroundColor: '#FF2E63',
  },
});