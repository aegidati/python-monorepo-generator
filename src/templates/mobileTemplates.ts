export function createMobilePackageJson(name: string): string {
    return `{
  "name": "${name}-mobile",
  "version": "0.1.0",
  "description": "React Native mobile app for ${name}",
  "main": "App.js",
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "test": "jest"
  },
  "dependencies": {
    "react": "18.3.1",
    "react-native": "0.76.5"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@babel/preset-env": "^7.26.0",
    "@babel/runtime": "^7.26.0",
    "@react-native/babel-preset": "0.76.5",
    "@react-native/metro-config": "0.76.5",
    "@react-native/typescript-config": "0.76.5",
    "@react-native-community/cli": "^15.1.3",
    "jest": "^29.7.0",
    "prettier": "^3.4.2"
  },
  "overrides": {
    "glob": "^11.0.0",
    "rimraf": "^6.0.1",
    "inflight": "npm:@zkochan/inflight@^1.0.0"
  },
  "engines": {
    "node": ">=18"
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
export function createMetroConfig(): string {
    return `const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
`;
}
