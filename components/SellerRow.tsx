import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { label } from '../constants/i18n';
import { useLang } from '../context/LanguageContext';
import type { Listing } from '../types/listing';
import { daysLeft, isNew, timeAgo } from '../utils/time';

const AVATAR_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6', '#F97316'];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// Instagram-style account line: who is selling (owner or agent) and when.
export default function SellerRow({ listing }: { listing: Listing }) {
  const { lang, t } = useLang();
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: avatarColor(listing.sellerName) }]}>
        <Text style={styles.initial}>{listing.sellerName.slice(0, 1).toUpperCase()}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {listing.sellerName}
      </Text>
      <View style={[styles.typeBadge, listing.sellerType === 'owner' && styles.ownerBadge]}>
        <Text style={[styles.typeText, listing.sellerType === 'owner' && styles.ownerText]}>
          {label.sellerType(lang, listing.sellerType)}
        </Text>
      </View>
      <Text style={styles.time} numberOfLines={1}>
        · {timeAgo(listing.createdAt, lang)}
      </Text>
      {isNew(listing.createdAt) ? (
        <View style={styles.newBadge}>
          <Text style={styles.newText}>{t('card.new')}</Text>
        </View>
      ) : (
        <Text style={[styles.time, daysLeft(listing.createdAt) <= 3 && styles.expiring]} numberOfLines={1}>
          · {t('card.daysLeft', { n: daysLeft(listing.createdAt) })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  avatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  initial: { color: Colors.white, fontWeight: '900', fontSize: 13 },
  name: { color: Colors.white, fontWeight: '700', fontSize: 13, flexShrink: 1 },
  typeBadge: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, backgroundColor: 'rgba(255,255,255,0.14)' },
  ownerBadge: { backgroundColor: 'rgba(16,185,129,0.22)' },
  typeText: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
  ownerText: { color: '#10B981' },
  time: { color: Colors.textFaint, fontSize: 12, flexShrink: 0 },
  expiring: { color: Colors.amber },
  newBadge: { backgroundColor: '#10B981', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  newText: { color: Colors.navy, fontSize: 10, fontWeight: '900', letterSpacing: 0.3 },
});
