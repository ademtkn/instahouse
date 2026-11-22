import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, LockKeyhole, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { ADMIN_PANEL_CODE } from '../../constants/config';
import { ADMIN_KEY } from '../../constants/storage';
import { useLang } from '../../context/LanguageContext';

interface AdminAuthValue {
  lock: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue>({ lock: () => {} });

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

// A prototype gate, not real security: the code ships in the bundle and the
// session lives on the device. Phase 2 moves admin access to Supabase roles.
export default function AdminGate({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLang();

  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ADMIN_KEY)
      .then((v) => setUnlocked(v === '1'))
      .catch(() => setUnlocked(false));
  }, []);

  const lock = useCallback(() => {
    AsyncStorage.removeItem(ADMIN_KEY).catch(() => {});
    setCode('');
    setError(false);
    setUnlocked(false);
  }, []);

  const unlock = useCallback(() => {
    if (code.trim() === ADMIN_PANEL_CODE) {
      AsyncStorage.setItem(ADMIN_KEY, '1').catch(() => {});
      setCode('');
      setError(false);
      setUnlocked(true);
      return;
    }
    setError(true);
  }, [code]);

  if (unlocked === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.amber} size="large" />
      </View>
    );
  }

  if (!unlocked) {
    return (
      <View style={[styles.gate, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24 }]}>
        <Pressable
          style={styles.back}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t('admin.back')}
        >
          <ChevronLeft size={24} color={Colors.white} />
          <Text style={styles.backText}>{t('admin.back')}</Text>
        </Pressable>

        <View style={styles.gateCard}>
          <View style={styles.icon}>
            <ShieldCheck size={30} color={Colors.navy} />
          </View>
          <Text style={styles.title}>{t('admin.gateTitle')}</Text>
          <Text style={styles.body}>{t('admin.gateText')}</Text>

          <View style={styles.inputRow}>
            <LockKeyhole size={18} color={Colors.textFaint} />
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={(v) => {
                setCode(v);
                if (error) setError(false);
              }}
              placeholder={t('admin.code')}
              placeholderTextColor={Colors.textFaint}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={12}
              autoFocus
              onSubmitEditing={unlock}
              accessibilityLabel={t('admin.code')}
            />
          </View>
          {error && <Text style={styles.error}>{t('admin.wrongCode')}</Text>}

          <Pressable style={styles.primary} onPress={unlock} accessibilityRole="button">
            <Text style={styles.primaryText}>{t('admin.enter')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return <AdminAuthContext.Provider value={{ lock }}>{children}</AdminAuthContext.Provider>;
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' },
  gate: { flex: 1, backgroundColor: Colors.navy, paddingHorizontal: 18 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  gateCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    marginTop: '18%',
    backgroundColor: Colors.navyLight,
    borderRadius: 22,
    padding: 22,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  icon: { width: 58, height: 58, borderRadius: 29, backgroundColor: Colors.amber, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.white, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  body: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  inputRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  input: { flex: 1, color: Colors.white, fontSize: 18, letterSpacing: 3 },
  error: { color: Colors.danger, fontSize: 13, fontWeight: '600' },
  primary: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  primaryText: { color: Colors.navy, fontSize: 16, fontWeight: '900' },
});
