import { useState } from 'react';
import { Alert, Animated, Linking, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MessageCircle, Phone } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { DEMO_MODE } from '../constants/config';
import { translate, type Lang } from '../constants/i18n';
import { useCurrency } from '../context/CurrencyContext';
import { useLang } from '../context/LanguageContext';
import type { Listing } from '../types/listing';
import { priceLabel, type Currency } from '../utils/format';
import { listingTitle } from '../utils/title';
import { showDemoContact } from './DemoContactModal';

export const SITE_URL = 'https://ademtkn.github.io/instahouse';
export const listingUrl = (l: Listing) => `${SITE_URL}/?home=${l.id}`;
const fullTitle = (l: Listing, lang: Lang) => `${listingTitle(l, lang)}, ${l.district}`;

function tap() {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

async function open(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Açılamadı', 'Bu cihazda bu işlem desteklenmiyor.');
  }
}

export function openWhatsApp(l: Listing, lang: Lang, currency: Currency) {
  const digits = l.whatsappPhone.replace(/\D/g, '');
  const text = translate(lang, 'wa.message', { home: fullTitle(l, lang), price: priceLabel(l, l.priceUsd, lang, currency) });
  tap();
  if (DEMO_MODE) return showDemoContact({ kind: 'whatsapp', listing: l, message: text });
  open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`);
}

export function callSeller(l: Listing) {
  tap();
  if (DEMO_MODE) return showDemoContact({ kind: 'call', listing: l, message: '' });
  open(`tel:${l.sellerPhone}`);
}

// Share sheet where there is one (phones, native), otherwise straight to a
// WhatsApp composer with the link — a home is a family decision.
export async function shareListing(l: Listing, lang: Lang, currency: Currency) {
  const url = listingUrl(l);
  const title = fullTitle(l, lang);
  const text = translate(lang, 'share.text', { home: title, price: priceLabel(l, l.priceUsd, lang, currency), url });
  tap();
  if (Platform.OS === 'web') {
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.share) {
      try {
        await nav.share({ title, text, url });
        return;
      } catch {
        /* user cancelled, or share not permitted: fall through */
      }
    }
    open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    return;
  }
  try {
    await Share.share(Platform.OS === 'ios' ? { message: text, url } : { message: text });
  } catch {
    /* cancelled */
  }
}

function BigButton({
  label,
  color,
  textColor,
  icon,
  onPress,
}: {
  label: string;
  color: string;
  textColor: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  const scale = useState(() => new Animated.Value(1))[0];
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: Platform.OS !== 'web', speed: 40, bounciness: 8 }).start();

  return (
    <Animated.View style={[styles.flex, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => to(0.94)}
        onPressOut={() => to(1)}
        style={[styles.button, { backgroundColor: color }]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {icon}
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ActionButtons({ listing }: { listing: Listing }) {
  const { lang, t } = useLang();
  const { currency } = useCurrency();
  return (
    <View style={styles.row}>
      <BigButton
        label={t('btn.whatsapp')}
        color={Colors.whatsapp}
        textColor={Colors.white}
        icon={<MessageCircle size={22} color={Colors.white} strokeWidth={2.4} />}
        onPress={() => openWhatsApp(listing, lang, currency)}
      />
      <BigButton
        label={t('btn.call')}
        color={Colors.amber}
        textColor={Colors.navy}
        icon={<Phone size={22} color={Colors.navy} strokeWidth={2.4} />}
        onPress={() => callSeller(listing)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  button: {
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  label: { fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
});
