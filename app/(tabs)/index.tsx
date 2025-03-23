import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Redirect to the items tab
  return <Redirect href="/items" />;
}
