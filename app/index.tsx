import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { colors } from '@/theme/tokens';

export default function IndexRoute() {
  const router = useRouter();
  const { profile, isLoaded } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    if (!isLoaded) return;
    if (profile) {
      router.replace('/(tabs)');
    } else {
      router.replace('/setup');
    }
  }, [isLoaded, profile, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
