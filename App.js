import React, { useState, useEffect, createContext, useMemo  } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { auth, db } from './firebaseConfig';

// Import screens
import LoginScreen from './Screens/LoginScreens';
import SignupScreen from './Screens/Signup';
import ForgotPasswordScreen from './Screens/ForgotPassword';
import Home from './Screens/Home';
import AddService from './Screens/AddServices';
import ServiceDetail from './Screens/ServiceDetail';
import EditService from './Screens/EditService';
import HomeUser from './Screens/HomeUser';
import Favorites from './Screens/Favorites';
import Profile from './Screens/Profile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
export const FavoritesContext = createContext();
export const AuthContext = React.createContext();

function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transaction') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Customer') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Setting') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={AdminStackNavigator}
        options={{ headerShown: false, title: 'Home' }}
      />
      <Tab.Screen name="Transaction" component={Home} />
      <Tab.Screen name="Customer" component={Home} />
      <Tab.Screen name="Setting" component={Home} />
    </Tab.Navigator>
  );
}

function AdminStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="Home" 
        component={Home}
        options={({ navigation }) => ({
          headerRight: () => (
            <Icon 
              name="account-circle" 
              size={24} 
              color="#000" 
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('Profile')}
            />
          ),
        })}
      />
      <Stack.Screen name="AddService" component={AddService} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetail} />
      <Stack.Screen name="EditService" component={EditService} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}

function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'favorite' : 'favorite-border';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
        <Tab.Screen 
        name="HomeTab" 
        component={UserStack}
        options={{ headerShown: false, title: 'Home' }}
      />
       {/* <Tab.Screen name="HomeUser" component={UserStack} /> */}
       <Tab.Screen name="Favorites" component={Favorites} />
    </Tab.Navigator>
  );
}

function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="HomeUser" 
        component={HomeUser}
        options={({ navigation }) => ({
          headerRight: () => (
            <Icon 
              name="account-circle" 
              size={24} 
              color="#000" 
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('Profile')}
            />
          ),
        })}
      />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetail} />
      {/* <Stack.Screen name="Favorites" component={Favorites} /> */}
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, userRole } = React.useContext(AuthContext);
  
  if (user == null) {
    return <AuthStack />;
  }

  return userRole === 'admin' ? <AdminTabNavigator /> : <UserTabNavigator />;
}

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [favorites, setFavorites] = useState([]);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, 'user', authUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({...userData, id: authUser.uid});
          setUserRole(userData?.role);
          
          // Convert array of favorite IDs to an object
          const favoritesObject = (userData?.favorites || []).reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {});
          setFavorites(favoritesObject);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setFavorites({});
      }
    });
  
    return () => unsubscribe();
  }, []);

  const toggleFavorite = async (serviceId) => {
    if (user && user.id) {
      const userRef = doc(db, 'user', user.id);
      const newFavorites = { ...favorites };
      
      if (newFavorites[serviceId]) {
        delete newFavorites[serviceId];
        await updateDoc(userRef, {
          favorites: arrayRemove(serviceId)
        });
      } else {
        newFavorites[serviceId] = true;
        await updateDoc(userRef, {
          favorites: arrayUnion(serviceId)
        });
      }
      
      setFavorites(newFavorites);
    }
  };

  const favoritesContext = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite: (serviceId) => !!favorites[serviceId],
    }),
    [favorites]
  );

  const authContext = useMemo(
    () => ({
      signIn: async (userData, userRole) => {
        if (!userData.id) {
          console.error('User ID is missing from userData');
          return;
        }
        setUser(userData);
        setUserRole(userRole);
        setFavorites(userData?.favorites || []);
      },
      signOut: () => {
        setUser(null);
        setUserRole(null);
        setFavorites([]);
      },
      user,
      userRole,
    }),
    [user, userRole]
  );

  return (
    <AuthContext.Provider value={authContext}>
      <FavoritesContext.Provider value={favoritesContext}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </FavoritesContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;