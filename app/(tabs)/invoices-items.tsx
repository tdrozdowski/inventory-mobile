import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define the InvoiceItem type based on the API schema
interface InvoiceItem {
  invoice_id: string;
  item_id: string;
}

// For display purposes, we'll include more information
interface InvoiceItemDisplay extends InvoiceItem {
  id: number; // For React key
  invoiceNumber: string;
  itemName: string;
  itemPrice: number;
}

export default function InvoicesItemsScreen() {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoice items from the API
  useEffect(() => {
    const fetchInvoiceItems = async () => {
      try {
        // In a real app, replace with actual API endpoint
        // const response = await fetch('https://your-api-url/invoices-items');
        // const data = await response.json();
        
        // For demo purposes, using mock data
        const mockInvoiceItems: InvoiceItemDisplay[] = [
          {
            id: 1,
            invoice_id: '1',
            item_id: '1',
            invoiceNumber: 'INV001',
            itemName: 'Sample Item 1',
            itemPrice: 19.99
          },
          {
            id: 2,
            invoice_id: '1',
            item_id: '2',
            invoiceNumber: 'INV001',
            itemName: 'Sample Item 2',
            itemPrice: 29.99
          },
          {
            id: 3,
            invoice_id: '2',
            item_id: '1',
            invoiceNumber: 'INV002',
            itemName: 'Sample Item 1',
            itemPrice: 19.99
          }
        ];
        
        setInvoiceItems(mockInvoiceItems);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch invoice items');
        setLoading(false);
        console.error(err);
      }
    };

    fetchInvoiceItems();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#DCA1A1', dark: '#471D1D' }}
      headerImage={
        <IconSymbol
          size={200}
          name="doc.text.magnifyingglass"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Invoice Items</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedText>Loading invoice items...</ThemedText>
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : (
        <>
          {invoiceItems.map((item) => (
            <ThemedView key={item.id} style={styles.invoiceItemContainer}>
              <ThemedView style={styles.invoiceItemHeader}>
                <ThemedText type="subtitle">Invoice: {item.invoiceNumber}</ThemedText>
              </ThemedView>
              <ThemedText>Item: {item.itemName}</ThemedText>
              <ThemedText>Price: ${item.itemPrice.toFixed(2)}</ThemedText>
              <ThemedView style={styles.idsContainer}>
                <ThemedText style={styles.idText}>Invoice ID: {item.invoice_id}</ThemedText>
                <ThemedText style={styles.idText}>Item ID: {item.item_id}</ThemedText>
              </ThemedView>
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
  invoiceItemContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  invoiceItemHeader: {
    marginBottom: 8,
  },
  idsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    color: 'red',
  },
  idText: {
    opacity: 0.6,
  },
});
