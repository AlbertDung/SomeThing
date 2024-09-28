import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AuthContext, FavoritesContext } from "../App";
import { useFocusEffect } from "@react-navigation/native";


const Favorites = () => {
  const [favoriteServices, setFavoriteServices] = useState([]);
  const { user } = useContext(AuthContext);
  const { favorites, toggleFavorite, isFavorite } =
    useContext(FavoritesContext);

  const fetchFavoriteServices = useCallback(async () => {
    const favoriteIds = Object.keys(favorites);
    if (user && user.id && favoriteIds.length > 0) {
      const servicesCollection = collection(db, "service");
      const servicesSnapshot = await getDocs(servicesCollection);
      const allServices = servicesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const favoriteServices = allServices.filter((service) =>
        favoriteIds.includes(service.id)
      );
      setFavoriteServices(favoriteServices);
    } else {
      setFavoriteServices([]);
    }
  }, [user, favorites]);

  useFocusEffect(
    useCallback(() => {
      fetchFavoriteServices();
    }, [fetchFavoriteServices])
  );

  const removeFromFavorites = (serviceId) => {
    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to remove this service from your favorites?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            toggleFavorite(serviceId);
            setFavoriteServices((prev) =>
              prev.filter((service) => service.id !== serviceId)
            );
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.serviceInfo}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>Price: ${item.price}</Text>
      </View>
      <TouchableOpacity
        onPress={() => removeFromFavorites(item.id)}
        style={styles.removeButton}
      >
        <Icon name="close" size={24} color="#FF0000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Favorite Services</Text>
      {favoriteServices.length > 0 ? (
        <FlatList
          data={favoriteServices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text style={styles.noFavoritesText}>
          You don't have any favorite services yet.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  price: {
    fontSize: 16,
    color: "#666",
  },
  removeButton: {
    padding: 8,
  },
  noFavoritesText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
});

export default Favorites;
