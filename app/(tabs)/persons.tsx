import { StyleSheet } from 'react-native';
import { useEffect, useState, useCallback } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Person, personsApi, ApiError } from '@/services/api';

export default function PersonsScreen() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    apiUrl?: string;
    apiEnvironment?: string;
  }>({});

  // Fetch persons from the API - memoized with useCallback so it can be used as a dependency and for retry
  const fetchPersons = useCallback(async () => {
    // Reset state before fetching
    setLoading(true);
    setError(null);

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
  }, []);

  // Fetch persons on component mount
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
      </ThemedView>

      {loading ? (
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
});
