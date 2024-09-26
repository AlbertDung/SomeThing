import React, { useState, useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from './firebaseConfig';

// Import screens
import LoginScreen from './Screens/LoginScreens';
import SignupScreen from './Screens/Signup';
import ForgotPasswordScreen from './Screens/ForgotPassword';
import Home from './Screens/Home';
// import AddService from './Screens/AddService';
// import ServiceDetail from './Screens/ServiceDetail';
// import EditService from './Screens/EditService';
import HomeUser from './Screens/HomeUser';
// import UserFavoriteService from './Screens/UserFavoriteService';
// import Profile from './Screens/Profile';

const Stack = createStackNavigator();
export const AuthContext = React.createContext();

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      {/* <Stack.Screen name="AddService" component={AddService} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetail} />
      <Stack.Screen name="EditService" component={EditService} />
      <Stack.Screen name="Profile" component={Profile} /> */}
    </Stack.Navigator>
  );
}

function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeUser" component={HomeUser} />
      {/* <Stack.Screen name="UserFavoriteService" component={UserFavoriteService} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetail} />
      <Stack.Screen name="Profile" component={Profile} /> */}
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

  return userRole === 'admin' ? <AdminStack /> : <UserStack />;
}

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userDocRef = doc(db, 'user', authUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserRole(userData?.role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (user, userRole) => {
        setUser(user);
        setUserRole(userRole);
      },
      signOut: () => {
        setUser(null);
        setUserRole(null);
      },
      user,
      userRole,
    }),
    [user, userRole]
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

export default App;