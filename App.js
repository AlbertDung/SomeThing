  import React, { useState, useEffect, createContext, useMemo  } from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from '@react-navigation/stack';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import { onAuthStateChanged } from 'firebase/auth';
  import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
  import Icon from 'react-native-vector-icons/MaterialIcons';
  import { StatusBar } from 'react-native';
  import AntDesign from '@expo/vector-icons/AntDesign';
  import Ionicons from '@expo/vector-icons/Ionicons';
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
  import ServiceDetailsUser from './Screens/ServiceDetialsUser';
  
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();
  const RootStack = createStackNavigator();
  
  export const FavoritesContext = createContext();
  export const AuthContext = React.createContext();


  const theme = {
    dark: {
      background: '#171717',
      text: '#EDEDED',
      primary: '#DA0037',
      secondary: '#444444',
      accent: '#F0F5F9',
    },
    light: {
      background: '#F0F5F9',
      text: '#171717',
      primary: '#DA0037',
      secondary: '#444444',
      accent: '#EDEDED',
    },
  };

  function AdminTabNavigator() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'HomeTab') {
              return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
            } else if (route.name === 'Transaction') {
              return <AntDesign name={focused ? 'cloud' : 'cloudo'} size={size} color={color} />;
            } else if (route.name === 'Customer') {
              return <Ionicons name={focused ? 'people-sharp' : 'people-outline'} size={size} color={color} />;
            } else if (route.name === 'Setting') {  
              return <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />;
            }
          },
          tabBarActiveTintColor: theme.light.primary,
          tabBarInactiveTintColor: theme.light.secondary,
          tabBarStyle: {
            backgroundColor: theme.light.background,
            borderTopWidth: 0,
            elevation: 8,
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
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
      <Stack.Navigator 
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.light.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.light.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={Home}
          options={({ navigation }) => ({
            headerRight: () => (
              <Icon 
                name="account-circle" 
                size={28} 
                color={theme.light.primary}
                style={{ marginRight: 25 }}
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
          if (route.name === 'HomeUser') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          } else if (route.name === 'Favorites') {
            return <AntDesign name={focused ? 'heart' : 'hearto'} size={size} color={color} />;
          } 
          else if (route.name === 'Setting') {  
            return <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: theme.light.primary,
        tabBarInactiveTintColor: theme.light.secondary,
        tabBarStyle: {
          backgroundColor: theme.light.background,
          borderTopWidth: 0,
          elevation: 8,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      })}
      >
          <Tab.Screen 
          name="HomeUser" 
          component={UserStack}
          options={{ headerShown: false, title: 'Home' }}
        />
        {/* <Tab.Screen name="HomeUser" component={UserStack} /> */}
        <Tab.Screen name="Favorites" component={Favorites} />
        <Tab.Screen name="Setting" component={HomeUser} />
      </Tab.Navigator>
    );
  }

  function UserStack() {  
    return (
      <Stack.Navigator 
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.light.background,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.light.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="HomeUser" 
          component={HomeUser}
          options={({ navigation }) => ({
            headerRight: () => (
              <Icon 
                name="account-circle" 
                size={28} 
                color={theme.light.primary}
                style={{ marginRight: 25 }}
                onPress={() => navigation.navigate('Profile')}
              />
            ),
          })}
        />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="ServiceDetailsUser" component={ServiceDetailsUser} />
        {/* <Stack.Screen name="Favorites" component={Favorites} /> */}
      </Stack.Navigator>
    );
  }

  function AuthStack() {
    return (
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.light.background }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    );
  }
 
  function MainNavigator() {
    const { user, userRole } = React.useContext(AuthContext);
  
    if (user == null) {
      return <AuthStack />;
    } else if (userRole == 'admin') {
      return <AdminTabNavigator />;
    } else if (userRole == 'User') {
      return <UserTabNavigator />;
    } else {
      return <AuthStack />;
    }
  }
  
  function RootNavigator() {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={MainNavigator} />
        <RootStack.Screen name="Auth" component={AuthStack} />
      </RootStack.Navigator>
    );
  }

  function App() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [favorites, setFavorites] = useState({});

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
          setFavorites(userData?.favorites?.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {}) || {});
        },
        signOut: () => {
          auth.signOut().then(() => {
            setUser(null);
            setUserRole(null);
            setFavorites({});
          }).catch((error) => {
            console.error('Error signing out: ', error);
          });
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
            <StatusBar backgroundColor={theme.light.background} barStyle="dark-content" />
            <MainNavigator />
          </NavigationContainer>
        </FavoritesContext.Provider>
      </AuthContext.Provider>
    );
  }

  export default App;
