import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Modal, View, Animated, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Item, itemsApi } from '@/services/api';

// Check if we're in a test environment
const isTestEnvironment = 
  Platform.OS === 'web' && 
  typeof process !== 'undefined' && 
  process.env?.NODE_ENV === 'test';

interface CreateItemSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onItemCreated: (item: Item) => void;
}

export function CreateItemSheet({ isVisible, onClose, onItemCreated }: CreateItemSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    unitPrice?: string;
  }>({});

  const colorScheme = useColorScheme();
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Reset form when the sheet becomes visible
  useEffect(() => {
    if (isVisible) {
      resetForm();

      // In test environment, skip animation
      if (isTestEnvironment) {
        slideAnim.setValue(1);
      } else {
        // Animate the sheet sliding in
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else {
      // In test environment, skip animation
      if (isTestEnvironment) {
        slideAnim.setValue(0);
      } else {
        // Animate the sheet sliding out
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [isVisible]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setUnitPrice('');
    setErrors({});
  };

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      unitPrice?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!unitPrice.trim()) {
      newErrors.unitPrice = 'Unit price is required';
    } else {
      const price = parseFloat(unitPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.unitPrice = 'Unit price must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create a new item
  const createItem = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Create the item object
      const newItem = {
        name,
        description,
        unit_price: parseFloat(unitPrice),
        created_by: 'app-user', // Assuming a default user
        last_changed_by: 'app-user',
      };

      // Call the API to create the item
      const createdItem = await itemsApi.createItem(newItem);

      // Notify the parent component
      onItemCreated(createdItem);

      // Show success message
      Alert.alert('Success', 'Item created successfully');

      // Close the sheet
      handleClose();
    } catch (error) {
      console.error('Failed to create item:', error);
      Alert.alert('Error', 'Failed to create item');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing the sheet
  const handleClose = () => {
    // In test environment, skip animation
    if (isTestEnvironment) {
      slideAnim.setValue(0);
      onClose();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    }
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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
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
              <ThemedText type="title" style={styles.title}>Create New Item</ThemedText>
              <TouchableOpacity onPress={handleClose}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </ThemedView>

            <ScrollView>
              <ThemedView style={styles.content}>
                <ThemedText style={styles.label}>Name</ThemedText>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter item name"
                  placeholderTextColor="#999"
                  editable={!isLoading}
                />
                {errors.name && <ThemedText style={styles.errorText}>{errors.name}</ThemedText>}

                <ThemedText style={styles.label}>Description</ThemedText>
                <TextInput
                  style={[styles.input, errors.description && styles.inputError, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter item description"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  editable={!isLoading}
                />
                {errors.description && <ThemedText style={styles.errorText}>{errors.description}</ThemedText>}

                <ThemedText style={styles.label}>Unit Price</ThemedText>
                <TextInput
                  style={[styles.input, errors.unitPrice && styles.inputError]}
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                  placeholder="Enter unit price"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  editable={!isLoading}
                />
                {errors.unitPrice && <ThemedText style={styles.errorText}>{errors.unitPrice}</ThemedText>}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleClose}
                    disabled={isLoading}
                  >
                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.createButton, isLoading && styles.buttonDisabled]}
                    onPress={createItem}
                    disabled={isLoading}
                  >
                    <ThemedText style={styles.buttonText}>
                      {isLoading ? 'Creating...' : 'Create Item'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    width: '100%',
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
    maxHeight: '80%',
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
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: '#4A90E280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
});
