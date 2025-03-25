import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ConfigSheet } from '@/components/ConfigSheet';
import { CreateItemSheet } from '@/components/CreateItemSheet';
import { Item, itemsApi, ApiError } from '@/services/api';

export default function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    apiUrl?: string;
    apiEnvironment?: string;
  }>({});
  const [isConfigSheetVisible, setIsConfigSheetVisible] = useState(false);
  const [isCreateItemSheetVisible, setIsCreateItemSheetVisible] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  // Fetch items from the API - memoized with useCallback so it can be used as a dependency and for retry
  const fetchItems = useCallback(async () => {
    // Reset state before fetching
    setLoading(true);
    setError(null);

    try {
      // Fetch items from the API using the itemsApi service
      const fetchedItems = await itemsApi.getItems();

      setItems(fetchedItems);
      setLoading(false);
      // Clear any previous error details
      setErrorDetails({});
    } catch (err) {
      // Handle API errors
      const errorMessage = err instanceof ApiError 
        ? `API Error (${err.status}): ${err.message}` 
        : 'Failed to fetch items';

      setError(errorMessage);
      setLoading(false);
      console.error(err);

      // Store API details for debugging if available
      if (err instanceof ApiError) {
        setErrorDetails({
          apiUrl: err.url,
          apiEnvironment: err.environment
        });
      } else {
        // Clear any previous error details
        setErrorDetails({});
      }
    }
  }, []);

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle item deletion
  const handleDeleteItem = useCallback(async (id: number) => {
    try {
      setDeletingItemId(id);
      await itemsApi.deleteItem(id);
      // Remove the item from the state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      // Handle API errors
      const errorMessage = err instanceof ApiError 
        ? `API Error (${err.status}): ${err.message}` 
        : 'Failed to delete item';

      Alert.alert('Error', errorMessage);
      console.error(err);
    } finally {
      setDeletingItemId(null);
    }
  }, []);

  // Render the delete button for swipeable
  const renderRightActions = useCallback((item: Item) => {
    return (
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Item',
              `Are you sure you want to delete "${item.name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: () => handleDeleteItem(item.id)
                }
              ]
            );
          }}
        >
          <IconSymbol
            name="trash.fill"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  }, [handleDeleteItem]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={200}
          name="cube.box.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Items</ThemedText>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsCreateItemSheetVisible(true)}
          >
            <IconSymbol
              name="plus.circle.fill"
              size={24}
              color="#4A90E2"
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsConfigSheetVisible(true)}
          >
            <IconSymbol
              name="gear"
              size={24}
              color="#4A90E2"
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading items...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ErrorDisplay 
          message={error} 
          onRetry={fetchItems}
          apiUrl={errorDetails.apiUrl}
          apiEnvironment={errorDetails.apiEnvironment}
        />
      ) : (
        <>
          {items.map((item) => (
            <Animated.View 
              key={item.id} 
              entering={FadeIn} 
              exiting={FadeOut}
            >
              <Swipeable
                renderRightActions={() => renderRightActions(item)}
                friction={2}
                rightThreshold={40}
              >
                <ThemedView style={styles.itemContainer}>
                  {deletingItemId === item.id ? (
                    <View style={styles.loadingOverlay}>
                      <ThemedText>Deleting...</ThemedText>
                    </View>
                  ) : null}
                  <ThemedText type="subtitle">{item.name}</ThemedText>
                  <ThemedText>{item.description}</ThemedText>
                  <ThemedText>Price: ${!isNaN(parseFloat(item.unit_price)) ? parseFloat(item.unit_price).toFixed(2) : '0.00'}</ThemedText>
                  <ThemedText style={styles.idText}>ID: {item.alt_id}</ThemedText>
                </ThemedView>
              </Swipeable>
            </Animated.View>
          ))}
        </>
      )}

      {/* Config Sheet */}
      <ConfigSheet 
        isVisible={isConfigSheetVisible}
        onClose={() => setIsConfigSheetVisible(false)}
      />

      {/* Create Item Sheet */}
      <CreateItemSheet
        isVisible={isCreateItemSheetVisible}
        onClose={() => setIsCreateItemSheetVisible(false)}
        onItemCreated={(newItem) => {
          // Add the new item to the list and refresh
          setItems(prevItems => [newItem, ...prevItems]);
        }}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    right: 20,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  idText: {
    marginTop: 8,
    opacity: 0.6,
  },
  deleteButtonContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 8,
  },
});
