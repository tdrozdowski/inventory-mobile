import { StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define the Person type based on the API schema
interface Person {
  id: number;
  alt_id: string;
  name: string;
  email: string;
  created_by: string;
  created_at: string;
  last_update: string;
  last_changed_by: string;
}

export default function PersonsScreen() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch persons from the API
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        // In a real app, replace with actual API endpoint
        // const response = await fetch('https://your-api-url/persons');
        // const data = await response.json();
        
        // For demo purposes, using mock data
        const mockPersons: Person[] = [
          {
            id: 1,
            alt_id: 'PERSON001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            created_by: 'system',
            created_at: new Date().toISOString(),
            last_update: new Date().toISOString(),
            last_changed_by: 'system'
          },
          {
            id: 2,
            alt_id: 'PERSON002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            created_by: 'system',
            created_at: new Date().toISOString(),
            last_update: new Date().toISOString(),
            last_changed_by: 'system'
          }
        ];
        
        setPersons(mockPersons);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch persons');
        setLoading(false);
        console.error(err);
      }
    };

    fetchPersons();
  }, []);

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
        <ThemedText>Loading persons...</ThemedText>
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
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
  personContainer: {
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
