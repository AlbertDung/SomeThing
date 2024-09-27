import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext, FavoritesContext } from '../App';

const HomeUser = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useContext(AuthContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const servicesCollection = collection(db, 'service');
    const servicesSnapshot = await getDocs(servicesCollection);
    const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setServices(servicesList);
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

  const renderItem = ({ item }) => {
    const heartScale = new Animated.Value(1);

    const animateHeart = () => {
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1, duration: 100, useNativeDriver: true })
      ]).start();
      toggleFavorite(item.id);
    };

    return (
      <View style={styles.item}>
        <View style={styles.serviceInfo}>
          <Text style={styles.title}>{item.name}</Text>
          <Text>Price: ${item.price}</Text>
        </View>
        <TouchableOpacity onPress={animateHeart}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Icon 
              name={isFavorite(item.id) ? "favorite" : "favorite-border"} 
              size={24} 
              color={isFavorite(item.id) ? "red" : "#000"} 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search services"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginBottom: 16,
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default HomeUser;