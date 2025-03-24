import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { API_CONFIG, getCurrentEnvironment, updateApiHost, initializeApiConfig } from '@/constants/ApiConfig';

export default function ConfigScreen() {
  const [apiHost, setApiHost] = useState('');
  const [environment, setEnvironment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load the current configuration when the component mounts
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        // Initialize the API configuration
        await initializeApiConfig();
        
        // Set the state with the current values
        setApiHost(API_CONFIG.baseUrl);
        setEnvironment(getCurrentEnvironment());
      } catch (error) {
        console.error('Failed to load configuration:', error);
        Alert.alert('Error', 'Failed to load configuration');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Save the configuration
  const saveConfig = async () => {
    setIsLoading(true);
    try {
      // Validate the API host
      if (!apiHost) {
        Alert.alert('Error', 'API host cannot be empty');
        return;
      }

      // Update the API host
      await updateApiHost(apiHost);
      
      Alert.alert('Success', 'Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      Alert.alert('Error', 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>API Configuration</ThemedText>
      
      <ThemedText style={styles.label}>Current Environment</ThemedText>
      <ThemedView style={styles.environmentContainer}>
        <ThemedText style={styles.environmentText}>{environment}</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.label}>API Host</ThemedText>
      <TextInput
        style={styles.input}
        value={apiHost}
        onChangeText={setApiHost}
        placeholder="Enter API host"
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={saveConfig}
        disabled={isLoading}
      >
        <ThemedText style={styles.buttonText}>
          {isLoading ? 'Loading...' : 'Save Configuration'}
        </ThemedText>
      </TouchableOpacity>
      
      <ThemedText style={styles.note}>
        Note: Changes to the API host will take effect immediately.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  environmentContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  environmentText: {
    fontSize: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#4A90E280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 16,
  },
});
