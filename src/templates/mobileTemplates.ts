export function createMobilePackageJson(name: string): string {
    return `{
  "name": "${name}-mobile",
  "version": "0.1.0",
  "description": "React Native mobile app for ${name}",
  "main": "App.js",
  "scripts": {
    "start": "npx react-native start",
    "android": "npx react-native run-android",
    "ios": "npx react-native run-ios",
    "test": "jest"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.4"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/runtime": "^7.23.0",
    "@react-native/babel-preset": "^0.73.0",
    "@react-native/metro-config": "^0.73.0",
    "jest": "^29.7.0"
  }
}`;
}

export function createMobileApp(): string {
    return `// React Native mobile application

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

function App() {
  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/items');
      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      console.error('API test failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#007acc" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          <Text style={styles.title}>Mobile Application</Text>
          <Text style={styles.description}>
            Welcome to your React Native mobile application!
          </Text>
          <TouchableOpacity style={styles.button} onPress={testAPI}>
            <Text style={styles.buttonText}>Test API Connection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007acc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
`;
}