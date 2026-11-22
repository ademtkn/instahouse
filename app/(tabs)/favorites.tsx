import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, MapPin, MessageCircle, Phone, Share2, UserRound } from 'lucide-react-native';
import { callSeller, openWhatsApp, shareListing } from '../../components/ActionButtons';
import CurrencySwitch from '../../components/CurrencySwitch';
import { Colors } from '../../constants/colors';
import { label } from '../../constants/i18n';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useLang } from '../../context/LanguageContext';
import { useListings } from '../../context/ListingsContext';
import { publishedListings } from '../../utils/listingStatus';
import { priceLabel } from '../../utils/format';
import { listingTitle } from '../../utils/title';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ids, toggle } = useFavorites();
  const { user, requireAuth } = useAuth();
  const { lang, t } = useLang();
  const { currency } = useCurrency();
  const { listings: catalogue, ready } = useListings();

  // Only listings that are active, paid and unexpired can be in favourites.
  const favorites = publishedListings(catalogue ?? []).filter((l) => ids.has(l.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>{t('fav.title')}</Text>
        <CurrencySwitch />
      </View>


      {!user ? (
        <View style={styles.empty}>
          <UserRound size={52} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>{t('profile.guestTitle')}</Text>
          <Text style={styles.emptyText}>{t('profile.guestText')}</Text>
          <Pressable style={styles.cta} onPress={() => requireAuth()} accessibilityRole="button">
            <Text style={styles.ctaText}>{t('auth.register')}</Text>
          </Pressable>
        </View>
      ) : !ready ? null : favorites.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={52} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>{t('fav.emptyTitle')}</Text>
          <Text style={styles.emptyText}>{t('fav.emptyText')}</Text>
          <Pressable style={styles.cta} onPress={() => router.navigate('/')}>
            <Text style={styles.ctaText}>{t('fav.cta')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.photos[0].uri }} style={styles.thumb} contentFit="cover" />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                  {listingTitle(item, lang)}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{priceLabel(item, item.priceUsd, lang, currency)}</Text>
                  {item.oldPriceUsd !== undefined && item.oldPriceUsd > item.priceUsd && (
                    <Text style={styles.oldPrice}>{priceLabel(item, item.oldPriceUsd, lang, currency)}</Text>
                  )}
                </View>
                <View style={styles.city}>
                  <MapPin size={13} color={Colors.textFaint} />
                  <Text style={styles.cityText} numberOfLines={1}>
                    {item.district}, {label.city(lang, item.city)}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <View style={styles.actionRow}>
                  <Pressable onPress={() => shareListing(item, lang, currency)} hitSlop={8}>
                    <Share2 size={20} color={Colors.textMuted} />
                  </Pressable>
                  <Pressable onPress={() => toggle(item.id)} hitSlop={8}>
                    <Heart size={22} color={Colors.danger} fill={Colors.danger} />
                  </Pressable>
                </View>
                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: Colors.whatsapp }]}
                    onPress={() => openWhatsApp(item, lang, currency)}
                  >
                    <MessageCircle size={18} color={Colors.white} />
                  </Pressable>
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: Colors.amber }]}
                    onPress={() => callSeller(item)}
                  >
                    <Phone size={18} color={Colors.navy} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  heading: { color: Colors.white, fontSize: 28, fontWeight: '900', paddingHorizontal: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyTitle: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  cta: { marginTop: 8, backgroundColor: Colors.amber, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
  ctaText: { color: Colors.navy, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
  },
  thumb: { width: 92, height: 92, borderRadius: 12 },
  info: { flex: 1, gap: 4 },
  title: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { color: Colors.amber, fontSize: 18, fontWeight: '900' },
  oldPrice: { color: Colors.textFaint, fontSize: 12, textDecorationLine: 'line-through' },
  city: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cityText: { color: Colors.textFaint, fontSize: 12, flexShrink: 1 },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 92 },
  actionRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
