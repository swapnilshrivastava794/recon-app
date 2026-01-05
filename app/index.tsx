import { Redirect } from 'expo-router';

export default function Index() {
  // In a real app, you would check authentication state here
  // For now, we redirect to login as per user request "first login and sign up"
  return <Redirect href="/login" />;
}
