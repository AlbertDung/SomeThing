import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthContext, FavoritesContext } from '../App';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

const theme = {
  background: '#F0F5F9',
  text: '#171717',
  primary: '#DA0037',
  secondary: '#444444',
  accent: '#EDEDED',
};

const HomeUser = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useContext(AuthContext);
  const { favorites, toggleFavorite, isFavorite } = useContext(FavoritesContext);
  console.log('Current favorites:', favorites);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Welcome, ${user?.fullname || 'User'}`,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarButton}>
          <AntDesign name="user" size={24} color={theme.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, user]);

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
    console.log(`Is ${item.id} a favorite:`, isFavorite(item.id));
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('ServiceDetailsUser', { service: item })}
      >
        <View style={styles.serviceInfo}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.price}>${item.price}</Text>
          {/* <Text style={styles.creator}>Created by: {item.creator}</Text> */}
        </View>
        <TouchableOpacity onPress={animateHeart}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <AntDesign 
              name={isFavorite(item.id) ? "heart" : "hearto"} 
              size={24} 
              color={isFavorite(item.id) ? theme.primary : theme.secondary} 
            />
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor={theme.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <AntDesign name="search1" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.background,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: theme.secondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: theme.accent,
    color: theme.text,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  list: {
    paddingBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.accent,
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
    color: theme.text,
  },
  price: {
    fontSize: 16,
    color: theme.primary,
    marginBottom: 4,
  },
  creator: {
    fontSize: 14,
    color: theme.secondary,
  },
  avatarButton: {
    marginRight: 16,
  },
});

export default HomeUser;