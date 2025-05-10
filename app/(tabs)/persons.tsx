import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ConfigSheet } from '@/components/ConfigSheet';
import { Person, personsApi, ApiError } from '@/services/api';
import { getBearerToken } from '@/constants/ApiConfig';

export default function PersonsScreen() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    apiUrl?: string;
    apiEnvironment?: string;
  }>({});
  const [isConfigSheetVisible, setIsConfigSheetVisible] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Check if a token exists
  const checkToken = useCallback(async () => {
    const token = await getBearerToken();
    setHasToken(!!token);
    return !!token;
  }, []);

  // Fetch persons from the API - memoized with useCallback so it can be used as a dependency and for retry
  const fetchPersons = useCallback(async () => {
    // Reset state before fetching
    setLoading(true);
    setError(null);

    // Check if a token exists before fetching data
    const hasValidToken = await checkToken();
    if (!hasValidToken) {
      setLoading(false);
      return;
    }

    try {
      // Fetch persons from the API using the personsApi service
      const data = await personsApi.getPersons();

      setPersons(data);
      setLoading(false);
      // Clear any previous error details
      setErrorDetails({});
    } catch (err) {
      // Handle API errors
      const errorMessage = err instanceof ApiError
        ? `API Error (${err.status}): ${err.message}`
        : 'Failed to fetch persons';

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
  }, [checkToken]);

  // Check for token and fetch persons on component mount
  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0A1DC', dark: '#471D47' }}
      headerImage={
        <IconSymbol
          size={200}
          name="person.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Persons</ThemedText>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={fetchPersons}
          >
            <IconSymbol
              name="arrow.clockwise"
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

      {!hasToken ? (
        <ThemedView style={styles.noTokenContainer}>
          <ThemedText style={styles.noTokenText}>
            Authentication required to view persons.
          </ThemedText>
          <ThemedText style={styles.noTokenSubtext}>
            Please configure your API credentials.
          </ThemedText>
          <TouchableOpacity
            style={styles.configButton}
            onPress={() => setIsConfigSheetVisible(true)}
          >
            <ThemedText style={styles.configButtonText}>
              Configure API
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading persons...</ThemedText>
        </ThemedView>
      ) : error ? (
        <ErrorDisplay
          message={error}
          onRetry={fetchPersons}
          apiUrl={errorDetails.apiUrl}
          apiEnvironment={errorDetails.apiEnvironment}
        />
      ) : (
        <>
          {persons.map((person) => (
            <ThemedView key={person.id} style={styles.personContainer}>
              <ThemedText type="subtitle">{person.name}</ThemedText>
              <ThemedText>{person.email}</ThemedText>
              <ThemedText style={styles.idText}>ID: {person.alt_id}</ThemedText>
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
  personContainer: {
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
  noTokenContainer: {
    padding: 24,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noTokenText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  noTokenSubtext: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  configButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  configButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
