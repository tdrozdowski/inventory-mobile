import { Redirect } from 'expo-router';

export default function ExploreScreen() {
  // Redirect to the items tab
  return <Redirect href="/items" />;
}
