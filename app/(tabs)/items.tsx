import { StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ConfigSheet } from '@/components/ConfigSheet';
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
        <TouchableOpacity 
          style={styles.configButton}
          onPress={() => setIsConfigSheetVisible(true)}
        >
          <IconSymbol
            name="gear"
            size={24}
            color="#4A90E2"
          />
        </TouchableOpacity>
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
            <ThemedView key={item.id} style={styles.itemContainer}>
              <ThemedText type="subtitle">{item.name}</ThemedText>
              <ThemedText>{item.description}</ThemedText>
              <ThemedText>Price: ${!isNaN(parseFloat(item.unit_price)) ? parseFloat(item.unit_price).toFixed(2) : '0.00'}</ThemedText>
              <ThemedText style={styles.idText}>ID: {item.alt_id}</ThemedText>
            </ThemedView>
          ))}
        </>
      )}

      {/* Config Sheet */}
      <ConfigSheet 
        isVisible={isConfigSheetVisible}
        onClose={() => setIsConfigSheetVisible(false)}
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
  configButton: {
    padding: 8,
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
});
