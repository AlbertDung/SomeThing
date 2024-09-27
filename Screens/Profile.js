import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { AuthContext } from '../App';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Profile = ({ navigation }) => {
  const { user, signOut } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to change your avatar!');
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      console.log('User object:', user);
      if (!user || !user.id) {
        throw new Error('User ID is missing');
      }
      console.log('User ID:', user.id);
      const userRef = doc(db, 'user', user.id);
      console.log('User reference:', userRef);
      await updateDoc(userRef, {
        fullname,
        email,
        phone,
        address,
      });
      setEditing(false);
      Alert.alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error updating profile. Please try again.');
    }
  };

  const handleLogout = () => {
    signOut();
    navigation.navigate('Login');
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.uri);
      // Here you would typically upload the image to your server or cloud storage
      // and update the user's avatar URL in the database
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{getInitials(fullname)}</Text>
          </View>
        )}
        <Icon name="camera-alt" size={24} color="#fff" style={styles.cameraIcon} />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        {editing ? (
          <>
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={setFullname}
              placeholder="Full Name"
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone" keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Address"
            />
          </>
        ) : (
          <>
            <Text style={styles.infoText}>Full Name: {fullname}</Text>
            <Text style={styles.infoText}>Email: {email}</Text>
            <Text style={styles.infoText}>Phone: {phone}</Text>
            <Text style={styles.infoText}>Address: {address}</Text>
          </>
        )}
      </View>

      {editing ? (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 24,
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
  },
  infoContainer: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Profile;