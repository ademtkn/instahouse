import { useEffect } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FavoritesProvider } from '../context/FavoritesContext';
import { LanguageProvider } from '../context/LanguageContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { AuthProvider } from '../context/AuthContext';
import { ListingsProvider } from '../context/ListingsContext';
import SignInSheet from '../components/SignInSheet';
import { applyAndroidNavigationBar } from '../utils/navigationBar';

export default function RootLayout() {
  // iPad / Android tablets: keep the feed in a centred, phone-like column
  // instead of stretching every 9:16 card across the whole screen. The admin
  // panel is the exception: it uses the full width on purpose.
  const { width } = useWindowDimensions();
  const nativeTablet = Platform.OS !== 'web' && width >= 700;
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    applyAndroidNavigationBar();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
      <CurrencyProvider>
      <AuthProvider>
      <ListingsProvider>
      <FavoritesProvider>
        <StatusBar style="light" />
        {/* On desktop browsers and tablets, keep a phone-width column so the
            feed looks like the app instead of a stretched web page. */}
        <View style={[styles.outer, nativeTablet && !isAdmin && styles.outerTablet]}>
          <View
            style={[
              styles.frame,
              nativeTablet && !isAdmin && styles.frameTablet,
              isAdmin && styles.frameAdmin,
            ]}
          >
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.navy } }} />
          </View>
        </View>
        <SignInSheet />
      </FavoritesProvider>
      </ListingsProvider>
      </AuthProvider>
      </CurrencyProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#050A14' : Colors.navy, alignItems: 'center' },
  outerTablet: { backgroundColor: '#050A14' },
  frame: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 460 : undefined, overflow: 'hidden' },
  frameTablet: { maxWidth: 560 },
  frameAdmin: { maxWidth: 1200 },
});
