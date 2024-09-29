import { Switch } from 'react-native';
import { ThemeContext } from './ThemeContext';
import React, { useState, useEffect, createContext, useMemo,useContext  } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';

const SettingsScreen = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dark Mode</Text>
      <Switch
        value={theme === 'dark'}
        onValueChange={toggleTheme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      //backgroundColor: theme.background,
    },
    
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        //color: theme.text,
      },
    // ... rest of your styles ...
  });
export default SettingsScreen;