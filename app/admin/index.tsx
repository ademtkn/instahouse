import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Info, Lock, Search } from 'lucide-react-native';
import AdminTransfer from '../../components/admin/AdminTransfer';
import { useAdminAuth } from '../../components/admin/AdminGate';
import { AdminButton, AdminChip, Badge, SectionCard } from '../../components/admin/ui';
import { Colors } from '../../constants/colors';
import { LANGS, LANG_LABEL, label } from '../../constants/i18n';
import { useLang } from '../../context/LanguageContext';
import { useListings } from '../../context/ListingsContext';
import type { Listing } from '../../types/listing';
import { priceLabel } from '../../utils/format';
import { isActive, isExpired, isPaid } from '../../utils/listingStatus';
import { daysLeft, formatDateTime } from '../../utils/time';
import { listingTitle } from '../../utils/title';

type AdminFilter = 'all' | 'active' | 'inactive' | 'unpaid' | 'expired';

const FILTERS: AdminFilter[] = ['all', 'active', 'inactive', 'unpaid', 'expired'];

const COL = { status: 120, payment: 160, created: 148, actions: 292 };

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const { listings, ready, updateListing, removeListing, renewListing, replaceListings } = useListings();
  const { lock } = useAdminAuth();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AdminFilter>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<'export' | 'import' | null>(null);

  const all = useMemo(() => listings ?? [], [listings]);

  const stats = useMemo(() => {
    return {
      total: all.length,
      active: all.filter((l) => isActive(l) && !isExpired(l)).length,
      unpaid: all.filter((l) => !isPaid(l)).length,
      expiring: all.filter((l) => !isExpired(l) && daysLeft(l.createdAt) <= 3).length,
      expired: all.filter(isExpired).length,
    };
  }, [all]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all
      .filter((l) => {
        if (filter === 'active' && !(isActive(l) && !isExpired(l))) return false;
        if (filter === 'inactive' && isActive(l)) return false;
        if (filter === 'unpaid' && isPaid(l)) return false;
        if (filter === 'expired' && !isExpired(l)) return false;
        if (!q) return true;
        const hay = `${listingTitle(l, lang)} ${l.district} ${label.city(lang, l.city)} ${l.sellerName} ${l.id}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [all, filter, query, lang]);

  const toggleStatus = (l: Listing) => updateListing(l.id, { status: isActive(l) ? 'inactive' : 'active' });
  const togglePaid = (l: Listing) =>
    updateListing(
      l.id,
      isPaid(l)
        ? { paid: false, paidAt: undefined }
        : { paid: true, paidAt: new Date().toISOString() },
    );

  const rowHandlers = (l: Listing) => ({
    onEdit: () => router.push({ pathname: '/admin/edit', params: { id: l.id } }),
    onStatus: () => toggleStatus(l),
    onPaid: () => togglePaid(l),
    onRenew: () => renewListing(l.id),
    onDelete: () => setConfirmId(l.id),
    onConfirm: () => {
      removeListing(l.id);
      setConfirmId(null);
    },
    onCancel: () => setConfirmId(null),
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headRow}>
          <Pressable
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('admin.back')}
          >
            <ChevronLeft size={24} color={Colors.white} />
          </Pressable>
          <View style={styles.titleBox}>
            <Text style={styles.title}>{t('admin.title')}</Text>
            <Text style={styles.subtitle}>{t('admin.subtitle')}</Text>
          </View>
          {wide && (
            <View style={styles.langRow}>
              {LANGS.map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setLang(l)}
                  style={[styles.langChip, l === lang && styles.langChipActive]}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityState={{ selected: l === lang }}
                >
                  <Text style={[styles.langText, l === lang && styles.langTextActive]}>{LANG_LABEL[l]}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            style={styles.iconButton}
            onPress={lock}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('admin.lock')}
          >
            <Lock size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        {!wide && (
          <View style={styles.langRowMobile}>
            {LANGS.map((l) => (
              <Pressable
                key={l}
                onPress={() => setLang(l)}
                style={[styles.langChip, l === lang && styles.langChipActive]}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityState={{ selected: l === lang }}
              >
                <Text style={[styles.langText, l === lang && styles.langTextActive]}>{LANG_LABEL[l]}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Toolbar */}
        {wide ? (
          <View style={styles.toolbar}>
            <AdminButton label={`+ ${t('admin.new')}`} onPress={() => router.push('/admin/edit')} />
            <AdminButton label={t('admin.export')} tone="secondary" onPress={() => setTransfer('export')} />
            <AdminButton label={t('admin.import')} tone="secondary" onPress={() => setTransfer('import')} />
          </View>
        ) : (
          <>
            <AdminButton label={`+ ${t('admin.new')}`} onPress={() => router.push('/admin/edit')} />
            <View style={styles.toolbar}>
              <AdminButton
                label={t('admin.export')}
                tone="secondary"
                onPress={() => setTransfer('export')}
                style={styles.flexButton}
              />
              <AdminButton
                label={t('admin.import')}
                tone="secondary"
                onPress={() => setTransfer('import')}
                style={styles.flexButton}
              />
            </View>
          </>
        )}

        <View style={styles.note}>
          <Info size={15} color={Colors.amber} />
          <Text style={styles.noteText}>{t('admin.localNote')}</Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <Stat label={t('admin.stat.total')} value={stats.total} />
          <Stat label={t('admin.stat.active')} value={stats.active} tone="ok" />
          <Stat label={t('admin.stat.unpaid')} value={stats.unpaid} tone="warn" />
          <Stat label={t('admin.stat.expiring')} value={stats.expiring} tone="warn" />
          <Stat label={t('admin.stat.expired')} value={stats.expired} tone="danger" />
        </View>

        {/* Search + filters */}
        <SectionCard style={styles.filtersCard}>
          <View style={styles.searchBox}>
            <Search size={16} color={Colors.textFaint} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={t('admin.search')}
              placeholderTextColor={Colors.textFaint}
              autoCapitalize="none"
              accessibilityLabel={t('admin.search')}
            />
          </View>
          <View style={styles.filterChips}>
            {FILTERS.map((f) => (
              <AdminChip
                key={f}
                label={t(`admin.filter.${f}` as const)}
                active={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
            <Text style={styles.count}>{t('admin.listCount', { n: shown.length })}</Text>
          </View>
        </SectionCard>

        {/* List */}
        {!ready ? (
          <ActivityIndicator color={Colors.amber} size="large" style={styles.loading} />
        ) : shown.length === 0 ? (
          <SectionCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('admin.empty')}</Text>
            <Text style={styles.emptyHint}>{t('admin.emptyHint')}</Text>
          </SectionCard>
        ) : wide ? (
          <SectionCard style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colListing]}>{t('admin.col.listing')}</Text>
              <Text style={[styles.th, { width: COL.status }]}>{t('admin.col.status')}</Text>
              <Text style={[styles.th, { width: COL.payment }]}>{t('admin.col.payment')}</Text>
              <Text style={[styles.th, { width: COL.created }]}>{t('admin.col.created')}</Text>
              <Text style={[styles.th, { width: COL.actions }]}>{t('admin.col.actions')}</Text>
            </View>
            {shown.map((l) => (
              <WideRow
                key={l.id}
                listing={l}
                confirm={confirmId === l.id}
                handlers={rowHandlers(l)}
              />
            ))}
          </SectionCard>
        ) : (
          <View style={styles.cards}>
            {shown.map((l) => (
              <MobileCard
                key={l.id}
                listing={l}
                confirm={confirmId === l.id}
                handlers={rowHandlers(l)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AdminTransfer
        mode={transfer}
        listings={all}
        onClose={() => setTransfer(null)}
        onImport={replaceListings}
      />
    </View>
  );
}

function Stat({ label: text, value, tone }: { label: string; value: number; tone?: 'ok' | 'warn' | 'danger' }) {
  const color = tone === 'ok' ? '#10B981' : tone === 'danger' ? Colors.danger : tone === 'warn' ? Colors.amber : Colors.white;
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

interface Handlers {
  onEdit: () => void;
  onStatus: () => void;
  onPaid: () => void;
  onRenew: () => void;
  onDelete: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function WideRow({ listing: l, confirm, handlers }: { listing: Listing; confirm: boolean; handlers: Handlers }) {
  const { t, lang } = useLang();
  const expired = isExpired(l);
  const days = daysLeft(l.createdAt);
  return (
    <View style={styles.tr}>
      <View style={[styles.colListing, styles.listingCell]}>
        <Image source={{ uri: l.photos[0]?.uri }} style={styles.thumb} contentFit="cover" />
        <View style={styles.listingInfo}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {listingTitle(l, lang)}
          </Text>
          <Text style={styles.rowSub} numberOfLines={1}>
            {l.district}, {label.city(lang, l.city)} · {priceLabel(l, l.priceUsd, lang, 'usd')}
          </Text>
          <Text style={styles.rowId} numberOfLines={1}>
            {l.id} · {l.sellerName}
          </Text>
        </View>
      </View>

      <View style={{ width: COL.status }}>
        <Badge
          label={expired ? t('admin.expired') : isActive(l) ? t('admin.status.active') : t('admin.status.inactive')}
          tone={expired ? 'danger' : isActive(l) ? 'ok' : 'muted'}
        />
        <Switch
          value={isActive(l)}
          onValueChange={handlers.onStatus}
          trackColor={{ true: Colors.amber, false: Colors.navySoft }}
          thumbColor={Colors.white}
          accessibilityLabel={t('admin.col.status')}
        />
      </View>

      <View style={{ width: COL.payment }}>
        <Badge label={isPaid(l) ? t('admin.paid') : t('admin.unpaid')} tone={isPaid(l) ? 'info' : 'warn'} />
        <Text style={styles.code} numberOfLines={1}>
          {l.paymentCode || t('admin.noCode')}
        </Text>
        <Switch
          value={isPaid(l)}
          onValueChange={handlers.onPaid}
          trackColor={{ true: Colors.amber, false: Colors.navySoft }}
          thumbColor={Colors.white}
          accessibilityLabel={t('admin.col.payment')}
        />
      </View>

      <View style={{ width: COL.created }}>
        <Text style={styles.created}>{formatDateTime(l.createdAt)}</Text>
        <Text style={[styles.left, (expired || days <= 3) && styles.leftDanger]}>
          {expired ? t('admin.expired') : t('admin.daysLeft', { n: days })}
        </Text>
      </View>

      <View style={{ width: COL.actions }}>
        {confirm ? (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>{t('admin.deleteConfirm')}</Text>
            <View style={styles.confirmActions}>
              <AdminButton small label={t('admin.yes')} tone="danger" onPress={handlers.onConfirm} />
              <AdminButton small label={t('admin.no')} tone="secondary" onPress={handlers.onCancel} />
            </View>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <AdminButton small label={t('admin.edit')} tone="secondary" onPress={handlers.onEdit} />
            <AdminButton small label={t('admin.renew')} tone="ghost" onPress={handlers.onRenew} />
            <AdminButton small label={t('admin.delete')} tone="danger" onPress={handlers.onDelete} />
          </View>
        )}
      </View>
    </View>
  );
}

function MobileCard({ listing: l, confirm, handlers }: { listing: Listing; confirm: boolean; handlers: Handlers }) {
  const { t, lang } = useLang();
  const expired = isExpired(l);
  const days = daysLeft(l.createdAt);
  return (
    <SectionCard style={styles.mobileCard}>
      <View style={styles.mobileTop}>
        <Image source={{ uri: l.photos[0]?.uri }} style={styles.mobileThumb} contentFit="cover" />
        <View style={styles.listingInfo}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {listingTitle(l, lang)}
          </Text>
          <Text style={styles.rowSub} numberOfLines={1}>
            {l.district}, {label.city(lang, l.city)}
          </Text>
          <Text style={styles.price}>{priceLabel(l, l.priceUsd, lang, 'usd')}</Text>
        </View>
      </View>

      <View style={styles.mobileBadges}>
        <Badge
          label={expired ? t('admin.expired') : isActive(l) ? t('admin.status.active') : t('admin.status.inactive')}
          tone={expired ? 'danger' : isActive(l) ? 'ok' : 'muted'}
        />
        <Badge label={isPaid(l) ? t('admin.paid') : t('admin.unpaid')} tone={isPaid(l) ? 'info' : 'warn'} />
        <Text style={[styles.left, (expired || days <= 3) && styles.leftDanger]}>
          {expired ? t('admin.expired') : t('admin.daysLeft', { n: days })}
        </Text>
      </View>

      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>{t('admin.col.created')}</Text>
        <Text style={styles.metaValue}>{formatDateTime(l.createdAt)}</Text>
        <Text style={styles.metaLabel}>{t('admin.paymentCode')}</Text>
        <Text style={styles.metaValue}>{l.paymentCode || t('admin.noCode')}</Text>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>{t('admin.form.active')}</Text>
          <Switch
            value={isActive(l)}
            onValueChange={handlers.onStatus}
            trackColor={{ true: Colors.amber, false: Colors.navySoft }}
            thumbColor={Colors.white}
            accessibilityLabel={t('admin.col.status')}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>{t('admin.form.paid')}</Text>
          <Switch
            value={isPaid(l)}
            onValueChange={handlers.onPaid}
            trackColor={{ true: Colors.amber, false: Colors.navySoft }}
            thumbColor={Colors.white}
            accessibilityLabel={t('admin.col.payment')}
          />
        </View>
      </View>

      {confirm ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>{t('admin.deleteConfirm')}</Text>
          <View style={styles.confirmActions}>
            <AdminButton label={t('admin.yes')} tone="danger" onPress={handlers.onConfirm} style={styles.flexButton} />
            <AdminButton label={t('admin.no')} tone="secondary" onPress={handlers.onCancel} style={styles.flexButton} />
          </View>
        </View>
      ) : (
        <View style={styles.actionRow}>
          <AdminButton small label={t('admin.edit')} tone="secondary" onPress={handlers.onEdit} style={styles.flexButton} />
          <AdminButton small label={t('admin.renew')} tone="ghost" onPress={handlers.onRenew} style={styles.flexButton} />
          <AdminButton small label={t('admin.delete')} tone="danger" onPress={handlers.onDelete} style={styles.flexButton} />
        </View>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  content: { paddingHorizontal: 16, gap: 12, width: '100%', maxWidth: 1120, alignSelf: 'center' },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  back: { paddingVertical: 4 },
  titleBox: { flex: 1, minWidth: 180 },
  title: { color: Colors.white, fontSize: 26, fontWeight: '900' },
  subtitle: { color: Colors.textFaint, fontSize: 12, fontWeight: '600', marginTop: 2 },
  langRowMobile: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: Colors.glass,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  langRow: {
    flexDirection: 'row',
    backgroundColor: Colors.glass,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  langChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  langChipActive: { backgroundColor: Colors.amber },
  langText: { color: Colors.textMuted, fontSize: 11, fontWeight: '800' },
  langTextActive: { color: Colors.navy },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.navyLight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  flexButton: { flex: 1 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,176,32,0.08)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.3)',
  },
  noteText: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, flex: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: {
    flex: 1,
    minWidth: 96,
    backgroundColor: Colors.navyLight,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 2,
  },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { color: Colors.textFaint, fontSize: 11, fontWeight: '700' },
  filtersCard: { gap: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  searchInput: { flex: 1, color: Colors.white, fontSize: 14 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  count: { color: Colors.textFaint, fontSize: 12, fontWeight: '600', marginLeft: 4 },
  loading: { marginTop: 24 },
  emptyCard: { alignItems: 'center', paddingVertical: 28 },
  emptyTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  emptyHint: { color: Colors.textFaint, fontSize: 12, textAlign: 'center' },
  tableCard: { padding: 0, overflow: 'hidden' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    backgroundColor: Colors.navy,
  },
  th: { color: Colors.textFaint, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  colListing: { flex: 1, minWidth: 240 },
  listingCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: { width: 52, height: 52, borderRadius: 9, backgroundColor: Colors.navy },
  listingInfo: { flex: 1, gap: 2 },
  rowTitle: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  rowSub: { color: Colors.textMuted, fontSize: 12 },
  rowId: { color: Colors.textFaint, fontSize: 11 },
  code: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  created: { color: Colors.textMuted, fontSize: 12 },
  left: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 2 },
  leftDanger: { color: Colors.amber },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  confirmBox: { gap: 6 },
  confirmText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  confirmActions: { flexDirection: 'row', gap: 6 },
  cards: { gap: 10 },
  mobileCard: { gap: 10 },
  mobileTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  mobileThumb: { width: 62, height: 62, borderRadius: 10, backgroundColor: Colors.navy },
  price: { color: Colors.amber, fontSize: 15, fontWeight: '900' },
  mobileBadges: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metaBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  metaLabel: { color: Colors.textFaint, fontSize: 11, fontWeight: '700' },
  metaValue: { color: Colors.textMuted, fontSize: 12, marginRight: 8 },
  switchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  switchItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
});
