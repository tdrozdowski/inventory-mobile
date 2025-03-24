import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Modal, View, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { API_CONFIG, getCurrentEnvironment, updateApiHost, initializeApiConfig } from '@/constants/ApiConfig';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ConfigSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export function ConfigSheet({ isVisible, onClose }: ConfigSheetProps) {
  const [apiHost, setApiHost] = useState('');
  const [environment, setEnvironment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Load the current configuration when the component mounts or becomes visible
  useEffect(() => {
    if (isVisible) {
      loadConfig();
      // Animate the sheet sliding in
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animate the sheet sliding out
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

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
      onClose(); // Close the sheet after saving
    } catch (error) {
      console.error('Failed to save configuration:', error);
      Alert.alert('Error', 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing the sheet
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView 
          intensity={colorScheme === 'dark' ? 40 : 60} 
          style={StyleSheet.absoluteFill} 
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
        />
        <TouchableOpacity style={styles.dismissArea} onPress={handleClose} />
        
        <Animated.View 
          style={[
            styles.sheetContainer, 
            { 
              transform: [{ 
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                })
              }] 
            }
          ]}
        >
          <ThemedView style={styles.handle} />
          
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>API Configuration</ThemedText>
            <TouchableOpacity onPress={handleClose}>
              <IconSymbol name="xmark.circle.fill" size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={styles.content}>
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
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    // For dark mode support
    // We'll handle this with ThemedView inside
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CCCCCC',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
  },
  content: {
    backgroundColor: 'transparent',
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
