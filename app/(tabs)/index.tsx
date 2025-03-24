import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Redirect to the persons tab
  return <Redirect href="/persons" />;
}
