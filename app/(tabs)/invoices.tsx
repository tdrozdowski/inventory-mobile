import { StyleSheet } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Invoice, invoicesApi, ApiError } from '@/services/api';

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    apiUrl?: string;
    apiEnvironment?: string;
  }>({});

  // Fetch invoices from the API - memoized with useCallback so it can be used as a dependency and for retry
  const fetchInvoices = useCallback(async () => {
    // Reset state before fetching
    setLoading(true);
    setError(null);

    try {
      // Fetch invoices from the API using the invoicesApi service
      const data = await invoicesApi.getInvoices();

      setInvoices(data);
      setLoading(false);
      // Clear any previous error details
      setErrorDetails({});
    } catch (err) {
      // Handle API errors
      const errorMessage = err instanceof ApiError 
        ? `API Error (${err.status}): ${err.message}` 
        : 'Failed to fetch invoices';

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

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading invoices...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ErrorDisplay 
          message={error} 
          onRetry={fetchInvoices}
          apiUrl={errorDetails.apiUrl}
          apiEnvironment={errorDetails.apiEnvironment}
        />
      ) : (
        <>
          {invoices.map((invoice) => (
            <ThemedView key={invoice.id} style={styles.invoiceContainer}>
              <ThemedView style={styles.invoiceHeader}>
                <ThemedView style={styles.invoiceNumberContainer}>
                  <ThemedText type="subtitle" numberOfLines={1} ellipsizeMode="tail">
                    Invoice #{invoice.alt_id}
                  </ThemedText>
                </ThemedView>
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
              <ThemedText style={styles.idText} numberOfLines={1} ellipsizeMode="tail">ID: {invoice.id}</ThemedText>
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
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
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
  invoiceNumberContainer: {
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  idText: {
    marginTop: 8,
    opacity: 0.6,
  },
});
