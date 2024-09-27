import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const EditService = ({ route, navigation }) => {
  const { service } = route.params;
  const [name, setName] = useState(service.name || '');
  const [price, setPrice] = useState(service.price ? service.price.toString() : '');

  useEffect(() => {
    navigation.setOptions({ title: `Chỉnh sửa ${service.name || 'Dịch vụ'}` });
  }, [navigation, service.name]);

  const handleUpdate = async () => {
    if (name.trim() === '' || price.trim() === '') {
      Alert.alert('Lỗi', 'Tên và giá không được để trống');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
      return;
    }

    try {
      console.log('Đang cập nhật dịch vụ với ID:', service.id);
      console.log('Tên mới:', name.trim());
      console.log('Giá mới:', numericPrice);

      if (!service.id) {
        throw new Error('ID dịch vụ không hợp lệ');
      }

      const serviceRef = doc(db, 'service', service.id);
      const updateData = {
        name: name.trim(),
        price: numericPrice,
        time : serverTimestamp(),
        update: serverTimestamp()
      };

      console.log('Dữ liệu cập nhật:', JSON.stringify(updateData));

      await updateDoc(serviceRef, updateData);

      console.log('Dịch vụ đã được cập nhật thành công');

      Alert.alert('Thành công', 'Dịch vụ đã được cập nhật', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Lỗi khi cập nhật dịch vụ: ', error);
      console.error('Chi tiết lỗi:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      Alert.alert('Lỗi', `Không thể cập nhật dịch vụ. Lỗi: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tên dịch vụ:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên dịch vụ"
      />

      <Text style={styles.label}>Giá:</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Nhập giá"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Cập nhật dịch vụ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditService;