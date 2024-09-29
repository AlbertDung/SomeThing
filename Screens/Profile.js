import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, Animated } from 'react-native';
import { AuthContext } from '../App';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Profile = ({ navigation }) => {
  const { user, signOut } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [animatedValue] = useState(new Animated.Value(0));

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
      if (!user || !user.id) {
        throw new Error('User ID is missing');
      }
      const userRef = doc(db, 'user', user.id);
      const updatedData = {
        fullname,
        email,
        phone,
        address,
      };

      if (avatar && avatar !== user.avatar) {
        const avatarUrl = await uploadAvatar(avatar);
        updatedData.avatar = avatarUrl;
      }

      await updateDoc(userRef, updatedData);
      setEditing(false);
      Alert.alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error updating profile. Please try again.');
    }
  };

  const uploadAvatar = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `avatars/${user.id}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleLogout = () => {
    signOut();
    //navigation.navigate('Auth', { screen: 'Login' });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const animateInput = () => {
    Animated.timing(animatedValue, {
      toValue: editing ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    animateInput();
  }, [editing]);

  const inputStyle = {
    ...styles.input,
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#F0F5F9', '#EDEDED'],
    }),
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
        <View style={styles.cameraIconContainer}>
          <Icon name="camera-alt" size={20} color="#EDEDED" />
        </View>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        {editing ? (
          <>
            <Animated.View style={inputStyle}>
              <TextInput
                value={fullname}
                onChangeText={setFullname}
                placeholder="Full Name"
                placeholderTextColor="#444444"
              />
            </Animated.View>
            <Animated.View style={inputStyle}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#444444"
              />
            </Animated.View>
            <Animated.View style={inputStyle}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone"
                keyboardType="phone-pad"
                placeholderTextColor="#444444"
              />
            </Animated.View>
            <Animated.View style={inputStyle}>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Address"
                placeholderTextColor="#444444"
              />
            </Animated.View>
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

      <TouchableOpacity
        style={[styles.button, editing ? styles.saveButton : styles.editButton]}
        onPress={editing ? handleSave : () => setEditing(true)}
      >
        <Text style={styles.buttonText}>
          {editing ? 'Save Changes' : 'Edit Profile'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F5F9',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DA0037',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 40,
    color: '#EDEDED',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#444444',
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#444444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#171717',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#171717',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#DA0037',
  },
  editButton: {
    backgroundColor: '#444444',	
  },
  logoutButton: {
    backgroundColor: '#171717',
  },
  buttonText: {
    color: '#EDEDED',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;