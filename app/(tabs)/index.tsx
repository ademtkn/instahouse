import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { RefreshCw, SearchX } from 'lucide-react-native';
import ListingCard from '../../components/ListingCard';
import FilterBar from '../../components/FilterBar';
import CurrencySwitch from '../../components/CurrencySwitch';
import { Colors } from '../../constants/colors';
import { useFavorites } from '../../context/FavoritesContext';
import {
  DEFAULT_FILTERS,
  arrangeFeed,
  countFresh,
  filterListings,
  filtersFor,
  type FeedArrangement,
} from '../../services/listingService';
import { LANGS, LANG_LABEL } from '../../constants/i18n';
import { useLang } from '../../context/LanguageContext';
import { useListings } from '../../context/ListingsContext';
import { useSeenListings } from '../../hooks/useSeenListings';
import { PULL_MAX, PULL_THRESHOLD, usePullToRefresh } from '../../hooks/usePullToRefresh';
import type { Listing, ListingFilters } from '../../types/listing';
import { publishedListings } from '../../utils/listingStatus';

const IS_WEB = Platform.OS === 'web';
// On web, cards this far from the active one render as an empty placeholder.
const NEAR_CARDS = 2;
// How long the scroll position must stay still before the active card changes (web).
const SETTLE_MS = 120;
// A card counts as "seen" once it has been the active card this long.
const SEEN_AFTER_MS = 3000;

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { isFavorite, toggle, add } = useFavorites();
  const { lang, setLang, t } = useLang();
  // A shared link (…/?home=ID) opens with that listing on top.
  const { home: pinnedParam } = useLocalSearchParams<{ home?: string }>();
  const pinnedId = typeof pinnedParam === 'string' ? pinnedParam : null;

  const { listings: catalogue, ready: catalogueReady } = useListings();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [filters, setFilters] = useState<ListingFilters>(DEFAULT_FILTERS);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [barHeight, setBarHeight] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [seenAtLoad, setSeenAtLoad] = useState<Set<string>>(() => new Set());
  const listRef = useRef<FlatList<Listing>>(null);
  const navigation = useNavigation();
  const { ready: seenReady, markSeen, snapshot: snapshotSeen } = useSeenListings();

  // Unseen listings first (shuffled), then the ones this device has already seen.
  // Only active + paid + unexpired listings reach the feed.
  const buildFeed = useCallback(
    () => arrangeFeed(publishedListings(catalogue ?? []), snapshotSeen(), pinnedId),
    [catalogue, snapshotSeen, pinnedId],
  );
  const applyFeed = useCallback(({ listings: ordered, seenAtLoad: seenIds }: FeedArrangement) => {
    setListings(ordered);
    setSeenAtLoad(seenIds);
  }, []);

  useEffect(() => {
    if (!seenReady || !catalogueReady) return;
    let alive = true;
    // The store is local, but keep the deferred shape so the effect does not
    // set state synchronously (and so a fast admin edit cannot race the feed).
    Promise.resolve().then(() => {
      if (!alive) return;
      const feed = buildFeed();
      applyFeed(feed);
      // A shared rental must not be hidden behind the default "sale" switch.
      if (pinnedId) setFilters(filtersFor(feed.listings.find((l) => l.id === pinnedId)));
    });
    return () => {
      alive = false;
    };
  }, [seenReady, catalogueReady, buildFeed, applyFeed, pinnedId]);

  const scrollY = useRef(0);
  const sizeRef = useRef(size);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  // Refresh = reload the listings and reshuffle the unseen ones. It happens on
  // every pull / tab press, even with filters, so the top of the feed is always
  // a fresh random pick. Already-seen listings never move back to the top.
  const reload = useCallback(async () => {
    applyFeed(buildFeed());
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [buildFeed, applyFeed]);

  const { pull, refreshing, refreshNow, touchHandlers } = usePullToRefresh(reload, {
    isAtTop: () => scrollY.current <= 2,
    minStartY: insets.top + barHeight,
  });

  // Tapping the feed tab while already on it refreshes, like most feed apps.
  useEffect(() => {
    return navigation.addListener('tabPress' as never, () => {
      if (navigation.isFocused()) refreshNow();
    });
  }, [navigation, refreshNow]);

  const fresh = useMemo(() => countFresh(listings ?? []), [listings]);
  const visible = useMemo(() => filterListings(listings ?? [], filters), [listings, filters]);

  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [visible]);

  // Until the list reports what's on screen (or after the list changes), the first card is the active one.
  const currentId = visible.some((l) => l.id === activeId) ? activeId : (visible[0]?.id ?? null);
  const activeIndex = Math.max(0, visible.findIndex((l) => l.id === currentId));

  // The first already-seen card gets the divider, unless the feed starts with it
  // (nothing new above it to separate from).
  const dividerId = useMemo(() => {
    const idx = visible.findIndex((l) => seenAtLoad.has(l.id));
    return idx > 0 ? visible[idx].id : null;
  }, [visible, seenAtLoad]);

  // Dwelling on a card marks it as seen for next time.
  useEffect(() => {
    if (!currentId) return;
    const t = setTimeout(() => markSeen(currentId), SEEN_AFTER_MS);
    return () => clearTimeout(t);
  }, [currentId, markSeen]);

  // Web: the browser's CSS scroll-snap re-snaps to the nearest card whenever the
  // list's DOM changes mid-swipe, which made the feed jump around on its own.
  // So on web every card stays mounted (no virtualization) and the active card
  // is only updated once the scroll position has settled.
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);
  const onScroll = useCallback((y: number) => {
    scrollY.current = y;
    if (!IS_WEB) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const h = sizeRef.current.height;
      const list = visibleRef.current;
      if (!h || list.length === 0) return;
      const idx = Math.max(0, Math.min(list.length - 1, Math.round(y / h)));
      setActiveId(list[idx].id);
    }, SETTLE_MS);
  }, []);

  // FlatList requires this callback to keep the same identity for its lifetime.
  const [onViewableItemsChanged] = useState(
    () =>
      ({ viewableItems }: { viewableItems: { item: Listing; isViewable: boolean }[] }) => {
        const first = viewableItems.find((v) => v.isViewable);
        if (first?.item) setActiveId(first.item.id);
      },
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Listing; index: number }) => (
      <ListingCard
        listing={item}
        width={size.width}
        height={size.height}
        topOffset={insets.top + barHeight}
        isActive={item.id === currentId}
        isNear={!IS_WEB || Math.abs(index - activeIndex) <= NEAR_CARDS}
        seenDivider={item.id === dividerId}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggle}
        onDoubleTapFavorite={add}
      />
    ),
    [size, insets.top, barHeight, currentId, activeIndex, dividerId, isFavorite, toggle, add],
  );

  return (
    <View style={styles.container} onLayout={onLayout} {...(Platform.OS === 'web' ? touchHandlers : null)}>
      {!catalogueReady || listings === null || size.height === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.amber} size="large" />
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.center}>
          <SearchX size={48} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>{t('feed.empty')}</Text>
          <Pressable style={styles.reset} onPress={() => setFilters(DEFAULT_FILTERS)}>
            <Text style={styles.resetText}>{t('feed.reset')}</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.flex,
            { transform: [{ translateY: pull.interpolate({ inputRange: [0, PULL_MAX], outputRange: [0, PULL_MAX * 0.6] }) }] },
          ]}
        >
        <FlatList
          ref={listRef}
          onScroll={(e) => onScroll(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          data={visible}
          keyExtractor={(l) => l.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={size.height}
          snapToAlignment="start"
          getItemLayout={(_, index) => ({ length: size.height, offset: size.height * index, index })}
          onViewableItemsChanged={IS_WEB ? undefined : onViewableItemsChanged}
          refreshControl={
            Platform.OS === 'web' ? undefined : (
              <RefreshControl refreshing={refreshing} onRefresh={refreshNow} tintColor={Colors.amber} />
            )
          }
          viewabilityConfig={IS_WEB ? undefined : { itemVisiblePercentThreshold: 60 }}
          windowSize={IS_WEB ? 101 : 3}
          initialNumToRender={IS_WEB ? visible.length : 2}
          maxToRenderPerBatch={IS_WEB ? visible.length : 2}
          removeClippedSubviews={!IS_WEB}
        />
        </Animated.View>
      )}

      {Platform.OS === 'web' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pullIndicator,
            {
              top: insets.top + barHeight,
              opacity: pull.interpolate({ inputRange: [0, 25], outputRange: [0, 1], extrapolate: 'clamp' }),
              transform: [
                { translateY: pull.interpolate({ inputRange: [0, PULL_MAX], outputRange: [-30, PULL_MAX * 0.6] }) },
              ],
            },
          ]}
        >
          {refreshing ? (
            <ActivityIndicator color={Colors.navy} />
          ) : (
            <Animated.View
              style={{
                transform: [
                  { rotate: pull.interpolate({ inputRange: [0, PULL_THRESHOLD], outputRange: ['0deg', '300deg'], extrapolate: 'clamp' }) },
                ],
              }}
            >
              <RefreshCw size={20} color={Colors.navy} strokeWidth={2.6} />
            </Animated.View>
          )}
        </Animated.View>
      )}

      <View
        style={[styles.bar, { paddingTop: insets.top + 8 }]}
        onLayout={(e) => setBarHeight(e.nativeEvent.layout.height - insets.top)}
        pointerEvents="box-none"
      >
        <View style={styles.header}>
          <Pressable onPress={refreshNow} style={styles.logoWrap} hitSlop={8}>
            <Text style={styles.logo}>InstaHouse</Text>
          </Pressable>
          <View style={styles.switches}>
            <CurrencySwitch />
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
          </View>
        </View>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={visible.length}
          newToday={fresh.newToday}
          priceDrops={fresh.priceDrops}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  flex: { flex: 1 },
  pullIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  emptyTitle: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  reset: { backgroundColor: Colors.amber, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  resetText: { color: Colors.navy, fontWeight: '800' },
  bar: { position: 'absolute', top: 0, left: 0, right: 0, paddingBottom: 8, gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 14 },
  switches: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoWrap: { alignSelf: 'flex-start' },
  langRow: { flexDirection: 'row', backgroundColor: Colors.glass, borderRadius: 14, padding: 2, borderWidth: 1, borderColor: Colors.glassBorder },
  langChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  langChipActive: { backgroundColor: Colors.amber },
  langText: { color: Colors.textMuted, fontSize: 11, fontWeight: '800' },
  langTextActive: { color: Colors.navy },
  logo: { color: Colors.white, fontSize: 22, fontWeight: '900', letterSpacing: -0.5, paddingHorizontal: 16 },
});
