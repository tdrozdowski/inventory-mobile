import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define the Invoice type based on the API schema
interface Invoice {
  id: number;
  alt_id: string;
  total: number;
  paid: boolean;
  user_id: string;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
}

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoices from the API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // In a real app, replace with actual API endpoint
        // const response = await fetch('https://your-api-url/invoices');
        // const data = await response.json();
        
        // For demo purposes, using mock data
        const mockInvoices: Invoice[] = [
          {
            id: 1,
            alt_id: 'INV001',
            total: 149.99,
            paid: true,
            user_id: 'PERSON001',
            created_by: 'system',
            created_at: new Date().toISOString(),
            last_update: new Date().toISOString(),
            last_changed_by: 'system'
          },
          {
            id: 2,
            alt_id: 'INV002',
            total: 89.95,
            paid: false,
            user_id: 'PERSON002',
            created_by: 'system',
            created_at: new Date().toISOString(),
            last_update: new Date().toISOString(),
            last_changed_by: 'system'
          }
        ];
        
        setInvoices(mockInvoices);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch invoices');
        setLoading(false);
        console.error(err);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1DCA1', dark: '#1D471D' }}
      headerImage={
        <IconSymbol
          size={200}
          name="doc.text.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Invoices</ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedText>Loading invoices...</ThemedText>
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : (
        <>
          {invoices.map((invoice) => (
            <ThemedView key={invoice.id} style={styles.invoiceContainer}>
              <ThemedView style={styles.invoiceHeader}>
                <ThemedText type="subtitle">Invoice #{invoice.alt_id}</ThemedText>
                <ThemedView style={[
                  styles.statusBadge, 
                  { backgroundColor: invoice.paid ? '#c8e6c9' : '#ffcdd2' }
                ]}>
                  <ThemedText style={{ color: invoice.paid ? '#2e7d32' : '#c62828' }}>
                    {invoice.paid ? 'Paid' : 'Unpaid'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText>Total: ${invoice.total.toFixed(2)}</ThemedText>
              <ThemedText>User ID: {invoice.user_id}</ThemedText>
              <ThemedText style={styles.idText}>ID: {invoice.id}</ThemedText>
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
  invoiceContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
  },
  idText: {
    marginTop: 8,
    opacity: 0.6,
  },
});
