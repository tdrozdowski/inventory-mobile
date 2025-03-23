import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define the Item type based on the API schema
interface Item {
  id: number;
  alt_id: string;
  name: string;
  description: string;
  unit_price: number;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
}

export default function ItemsScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch items from the API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // In a real app, replace with actual API endpoint
        // const response = await fetch('https://your-api-url/items');
        // const data = await response.json();
        
        // For demo purposes, using mock data
        const mockItems: Item[] = [
          {
            id: 1,
            alt_id: 'ITEM001',
            name: 'Sample Item 1',
            description: 'This is a sample item',
            unit_price: 19.99,
            created_by: 'system',
            created_at: new Date().toISOString(),
            last_update: new Date().toISOString(),
            last_changed_by: 'system'
          },
          {
            id: 2,
            alt_id: 'ITEM002',
            name: 'Sample Item 2',
            description: 'This is another sample item',
            unit_price: 29.99,
            created_by: 'system',
            created_at: new Date().toISOString(),
            last_update: new Date().toISOString(),
            last_changed_by: 'system'
          }
        ];
        
        setItems(mockItems);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items');
        setLoading(false);
        console.error(err);
      }
    };

    fetchItems();
  }, []);

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
      </ThemedView>

      {loading ? (
        <ThemedText>Loading items...</ThemedText>
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : (
        <>
          {items.map((item) => (
            <ThemedView key={item.id} style={styles.itemContainer}>
              <ThemedText type="subtitle">{item.name}</ThemedText>
              <ThemedText>{item.description}</ThemedText>
              <ThemedText>Price: ${item.unit_price.toFixed(2)}</ThemedText>
              <ThemedText style={styles.idText}>ID: {item.alt_id}</ThemedText>
            </ThemedView>
          ))}
        </>
      )}
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
    gap: 8,
    marginBottom: 16,
  },
  itemContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  errorText: {
    color: 'red',
  },
  idText: {
    marginTop: 8,
    opacity: 0.6,
  },
});
