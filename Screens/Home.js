import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { collection, getDocs, doc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../App';

const Home = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddServiceVisible, setIsAddServiceVisible] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '' });
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `${user?.fullname || 'Admin'}`,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarButton}>
          <Icon name="account-circle" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, user]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);


  useFocusEffect(
    React.useCallback(() => {
      fetchServices();
    }, [])
  );

  const fetchServices = async () => {
    const servicesCollection = collection(db, 'service');
    const servicesSnapshot = await getDocs(servicesCollection);
    const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setServices(servicesList);
  };

  const handleDelete = (serviceId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "service", serviceId));
              fetchServices();
            } catch (error) {
              console.error("Error deleting service: ", error);
              Alert.alert("Error", "Unable to delete service. Please try again.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      fetchServices();
      return;
    }

    const servicesCollection = collection(db, 'service');
    const q = query(servicesCollection, where("name", ">=", searchQuery), where("name", "<=", searchQuery + '\uf8ff'));
    const querySnapshot = await getDocs(q);
    const searchResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setServices(searchResults);
  };

  const handleAddService = async () => {
    if (newService.name.trim() === '' || newService.price.trim() === '') {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "service"), {
        name: newService.name.trim(),
        price: parseFloat(newService.price),
        creator: user?.fullname || 'Admin',
      });
      setIsAddServiceVisible(false);
      setNewService({ name: '', price: '' });
      fetchServices();
    } catch (error) {
      console.error("Error adding service: ", error);
      Alert.alert("Error", "Unable to add service. Please try again.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={styles.serviceInfo}
        onPress={() => navigation.navigate('ServiceDetail', { service: item })}
      >
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.creator}>Created by: {item.creator}</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('EditService', { service: { ...item, id: item.id } })}
        >
          <Icon name="edit" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddServiceVisible(true)}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
      <Modal
        visible={isAddServiceVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddServiceVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Service</Text>
            <TextInput
              style={styles.input}
              placeholder="Service Name"
              value={newService.name}
              onChangeText={(text) => setNewService({ ...newService, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={newService.price}
              onChangeText={(text) => setNewService({ ...newService, price: text })}
              keyboardType="numeric"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddService}>
                <Text style={styles.modalButtonText}>Add Service</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddServiceVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  list: {
    paddingBottom: 80,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 4,
  },
  creator: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    marginRight: 0,
    marginLeft: 8,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  avatarButton: {
    marginRight: 16,
  },
});

export default Home;