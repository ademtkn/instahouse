import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import PhotoPicker from '../../components/admin/PhotoPicker';
import { AdminButton, AdminChip, AdminField, SectionCard } from '../../components/admin/ui';
import { CITIES } from '../../constants/cities';
import { Colors } from '../../constants/colors';
import { label } from '../../constants/i18n';
import { useLang } from '../../context/LanguageContext';
import { useListings } from '../../context/ListingsContext';
import type { City, DealType, Documents, Listing, Photo, PropertyType, SellerType } from '../../types/listing';
import { formatPhone } from '../../utils/format';
import { fullKgPhone, isValidKgPhone } from '../../utils/phone';
import { daysLeft, formatDateTime } from '../../utils/time';

const DEAL_TYPES: DealType[] = ['sale', 'rent'];
const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'dacha', 'land', 'commercial'];
const DOCUMENT_OPTIONS: Documents[] = ['redBook', 'ddu', 'none'];
const SELLER_TYPES: SellerType[] = ['owner', 'agent'];

type FormError = 'fields' | 'details' | 'phone' | 'photos' | null;

export default function AdminEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { listings, ready } = useListings();
  const router = useRouter();
  const { t } = useLang();
  const insets = useSafeAreaInsets();

  const listing = typeof id === 'string' ? (listings ?? []).find((l) => l.id === id) : undefined;

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.amber} size="large" />
      </View>
    );
  }

  if (id && !listing) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>{t('admin.notFound')}</Text>
        <AdminButton label={t('admin.back')} onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ListingForm
      key={listing?.id ?? 'new'}
      initial={listing}
      topInset={insets.top}
      onDone={() => router.back()}
    />
  );
}

function ListingForm({
  initial,
  topInset,
  onDone,
}: {
  initial?: Listing;
  topInset: number;
  onDone: () => void;
}) {
  const { t, lang } = useLang();
  const { addListing, updateListing } = useListings();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [dealType, setDealType] = useState<DealType>(initial?.dealType ?? 'sale');
  const [type, setType] = useState<PropertyType | null>(initial?.type ?? null);
  const [rooms, setRooms] = useState<number | null>(
    initial ? (initial.type === 'apartment' || initial.type === 'house' || initial.type === 'dacha' ? initial.rooms : null) : null,
  );
  const [area, setArea] = useState(initial ? String(initial.areaM2) : '');
  const [sotka, setSotka] = useState(initial?.landSotka !== undefined ? String(initial.landSotka) : '');
  const [floor, setFloor] = useState(initial?.floor !== undefined ? String(initial.floor) : '');
  const [totalFloors, setTotalFloors] = useState(
    initial?.totalFloors !== undefined ? String(initial.totalFloors) : '',
  );
  const [documents, setDocuments] = useState<Documents | null>(initial?.documents ?? null);
  const [furnished, setFurnished] = useState(initial?.furnished ?? false);
  const [city, setCity] = useState<City | null>(initial?.city ?? null);
  const [district, setDistrict] = useState(initial?.district ?? '');
  const [price, setPrice] = useState(initial ? String(initial.priceUsd) : '');
  const [sellerType, setSellerType] = useState<SellerType | null>(initial?.sellerType ?? null);
  const [sellerName, setSellerName] = useState(initial?.sellerName ?? '');
  const [phone, setPhone] = useState(initial ? formatPhone(initial.sellerPhone) : '+996 ');
  const [photos, setPhotos] = useState<string[]>((initial?.photos ?? []).map((p) => p.uri));
  const [active, setActive] = useState((initial?.status ?? 'active') === 'active');
  const [paid, setPaid] = useState(initial?.paid ?? false);
  const [paymentCode, setPaymentCode] = useState(initial?.paymentCode ?? '');
  const [error, setError] = useState<FormError>(null);

  const areaNum = Number(area.replace(/\D/g, ''));
  const sotkaNum = Number(sotka.replace(/\D/g, ''));
  const priceNum = Number(price.replace(/\D/g, ''));

  const showRooms = type === 'apartment' || type === 'house' || type === 'dacha';
  const showSotka = type === 'house' || type === 'dacha' || type === 'land';
  const showFloor = type === 'apartment' || type === 'commercial';
  const showFurniture = type !== null && type !== 'land';
  const isLand = type === 'land';
  const roomChips = type === 'apartment' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4];

  const save = () => {
    if (!type || !city) return setError('fields');
    if (!areaNum || areaNum <= 0) return setError('fields');
    if (!priceNum || priceNum <= 0) return setError('fields');
    if (!sellerName.trim()) return setError('fields');
    if (showRooms && rooms === null) return setError('details');
    if (isLand && !sotkaNum) return setError('details');
    if (!documents) return setError('details');
    if (!sellerType) return setError('details');
    if (!isValidKgPhone(phone)) return setError('phone');
    if (photos.length === 0) return setError('photos');

    const now = new Date().toISOString();
    const listing: Listing = {
      id: initial?.id ?? `ad-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      dealType,
      type,
      rooms: showRooms ? (rooms ?? 0) : 0,
      areaM2: areaNum,
      landSotka: showSotka && sotkaNum > 0 ? sotkaNum : undefined,
      floor: showFloor && floor.trim() ? Number(floor) : undefined,
      totalFloors: showFloor && totalFloors.trim() ? Number(totalFloors) : undefined,
      yearBuilt: initial?.yearBuilt,
      series: initial?.series,
      condition: initial?.condition ?? 'good',
      documents,
      furnished: showFurniture ? furnished : false,
      priceUsd: priceNum,
      oldPriceUsd: initial?.oldPriceUsd,
      city,
      district: district.trim() || '—',
      views: initial?.views ?? 0,
      likes: initial?.likes ?? 0,
      photos: photos.map((uri): Photo => ({ uri })),
      sellerName: sellerName.trim(),
      sellerType,
      sellerPhone: fullKgPhone(phone),
      whatsappPhone: fullKgPhone(phone),
      createdAt: initial?.createdAt ?? now,
      status: active ? 'active' : 'inactive',
      paid,
      paymentCode: paymentCode.trim() || undefined,
      paidAt: paid ? (initial?.paidAt ?? now) : undefined,
    };

    if (initial) updateListing(initial.id, listing);
    else addListing(listing);
    onDone();
  };

  const errorText =
    error === 'fields'
      ? t('admin.form.invalid')
      : error === 'details'
        ? t('admin.form.details')
        : error === 'phone'
          ? t('auth.phoneInvalid')
          : error === 'photos'
            ? t('admin.form.photoRequired')
            : null;

  const created = initial ? formatDateTime(initial.createdAt) : null;
  const left = initial ? daysLeft(initial.createdAt) : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('admin.back')}
        >
          <ChevronLeft size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {initial ? t('admin.form.edit') : t('admin.form.new')}
        </Text>
        {wide && <AdminButton label={t('admin.form.save')} onPress={save} />}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <SectionCard>
          <Text style={styles.sectionTitle}>{t('sell.formTitle')}</Text>

          <Text style={styles.label}>{t('sell.dealTypeLabel')}</Text>
          <View style={styles.segment}>
            {DEAL_TYPES.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDealType(d)}
                style={[styles.segmentItem, dealType === d && styles.segmentActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: dealType === d }}
              >
                <Text style={[styles.optionText, dealType === d && styles.optionTextActive]}>
                  {label.dealType(lang, d)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>{t('sell.propertyType')}</Text>
          <View style={styles.chips}>
            {PROPERTY_TYPES.map((p) => (
              <AdminChip
                key={p}
                label={label.type(lang, p)}
                active={type === p}
                onPress={() => {
                  setType(type === p ? null : p);
                  setError(null);
                }}
              />
            ))}
          </View>

          {showRooms && (
            <>
              <Text style={styles.label}>{t('sell.rooms')}</Text>
              <View style={styles.chips}>
                {roomChips.map((n) => (
                  <AdminChip
                    key={n}
                    label={n === 0 ? t('sell.roomStudio') : n === 4 ? t('sell.room4') : String(n)}
                    active={rooms === n}
                    onPress={() => {
                      setRooms(rooms === n ? null : n);
                      setError(null);
                    }}
                  />
                ))}
              </View>
            </>
          )}

          <View style={styles.row}>
            <AdminField
              label={t('sell.area')}
              value={area}
              onChangeText={(v) => {
                setArea(v);
                setError(null);
              }}
              keyboard="number-pad"
              placeholder="58"
              maxLength={6}
              style={styles.flex}
            />
            {showSotka && (
              <AdminField
                label={t('sell.landSotka')}
                value={sotka}
                onChangeText={(v) => {
                  setSotka(v);
                  setError(null);
                }}
                keyboard="number-pad"
                placeholder="6"
                maxLength={5}
                style={styles.flex}
              />
            )}
          </View>

          {showFloor && (
            <View style={styles.row}>
              <AdminField
                label={t('sell.floor')}
                value={floor}
                onChangeText={setFloor}
                keyboard="number-pad"
                placeholder="5"
                maxLength={3}
                style={styles.flex}
              />
              <AdminField
                label={t('sell.totalFloors')}
                value={totalFloors}
                onChangeText={setTotalFloors}
                keyboard="number-pad"
                placeholder="9"
                maxLength={3}
                style={styles.flex}
              />
            </View>
          )}

          <Text style={styles.label}>{t('sell.documents')}</Text>
          <View style={styles.chips}>
            {DOCUMENT_OPTIONS.map((d) => (
              <AdminChip
                key={d}
                label={label.documents(lang, d)}
                active={documents === d}
                onPress={() => {
                  setDocuments(documents === d ? null : d);
                  setError(null);
                }}
              />
            ))}
          </View>

          {showFurniture && (
            <>
              <Text style={styles.label}>{t('sell.furnished')}</Text>
              <View style={styles.chips}>
                <AdminChip label={t('sell.furnishedYes')} active={furnished} onPress={() => setFurnished(true)} />
                <AdminChip label={t('sell.furnishedNo')} active={!furnished} onPress={() => setFurnished(false)} />
              </View>
            </>
          )}

          <AdminField
            label={dealType === 'rent' ? t('sell.priceRent') : t('sell.price')}
            value={price}
            onChangeText={(v) => {
              setPrice(v);
              setError(null);
            }}
            keyboard="number-pad"
            placeholder="55 000"
            maxLength={9}
          />
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>{t('admin.form.location')}</Text>
          <Text style={styles.label}>{t('filter.city')}</Text>
          <View style={styles.chips}>
            {CITIES.map((c) => (
              <AdminChip
                key={c}
                label={label.city(lang, c)}
                active={city === c}
                onPress={() => {
                  setCity(c);
                  setError(null);
                }}
              />
            ))}
          </View>
          <AdminField
            label={t('sell.district')}
            value={district}
            onChangeText={setDistrict}
            placeholder="Центр, ул. Киевская"
            maxLength={60}
          />
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>{t('admin.form.seller')}</Text>
          <AdminField
            label={t('admin.form.sellerName')}
            value={sellerName}
            onChangeText={(v) => {
              setSellerName(v);
              setError(null);
            }}
            placeholder="Айбек Токтосунов"
            maxLength={40}
          />
          <Text style={styles.label}>{t('sell.sellerType')}</Text>
          <View style={styles.chips}>
            {SELLER_TYPES.map((s) => (
              <AdminChip
                key={s}
                label={label.sellerType(lang, s)}
                active={sellerType === s}
                onPress={() => {
                  setSellerType(s);
                  setError(null);
                }}
              />
            ))}
          </View>
          <AdminField
            label={t('sell.phone')}
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setError(null);
            }}
            keyboard="phone-pad"
            placeholder={t('sell.phoneHint')}
            maxLength={20}
          />
        </SectionCard>

        <SectionCard>
          <PhotoPicker photos={photos} onChange={setPhotos} />
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>{t('admin.form.status')}</Text>
          <View style={styles.toggleRow}>
            <View style={styles.flex}>
              <Text style={styles.toggleLabel}>{t('admin.form.active')}</Text>
              <Text style={styles.toggleHint}>{t('admin.paymentNote')}</Text>
            </View>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ true: Colors.amber, false: Colors.navySoft }}
              thumbColor={Colors.white}
              accessibilityLabel={t('admin.form.active')}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, styles.flex]}>{t('admin.form.paid')}</Text>
            <Switch
              value={paid}
              onValueChange={setPaid}
              trackColor={{ true: Colors.amber, false: Colors.navySoft }}
              thumbColor={Colors.white}
              accessibilityLabel={t('admin.form.paid')}
            />
          </View>
          <AdminField
            label={t('admin.form.paymentCode')}
            value={paymentCode}
            onChangeText={setPaymentCode}
            placeholder="MBANK-12345"
            maxLength={40}
          />
          {created && (
            <View style={styles.createdRow}>
              <Text style={styles.createdLabel}>{t('admin.form.created')}</Text>
              <Text style={styles.createdValue}>{created}</Text>
              <Text style={styles.createdLabel}>{t('admin.col.left')}</Text>
              <Text style={[styles.createdValue, (left ?? 0) <= 0 && styles.expired]}>
                {left !== null && left <= 0
                  ? t('admin.expired')
                  : t('admin.daysLeft', { n: left ?? 0 })}
              </Text>
            </View>
          )}
        </SectionCard>

        {errorText && <Text style={styles.error}>{errorText}</Text>}

        <View style={styles.actions}>
          <AdminButton label={t('admin.form.cancel')} tone="secondary" onPress={() => router.back()} />
          <AdminButton label={t('admin.form.save')} onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  center: { flex: 1, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center', gap: 14 },
  notFound: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  back: { paddingVertical: 4 },
  title: { color: Colors.white, fontSize: 20, fontWeight: '900', flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  sectionTitle: { color: Colors.white, fontSize: 15, fontWeight: '900' },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  flex: { flex: 1 },
  segment: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 2,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignSelf: 'flex-start',
  },
  segmentItem: { paddingHorizontal: 16, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: Colors.amber },
  optionText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  optionTextActive: { color: Colors.navy, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 10 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  toggleHint: { color: Colors.textFaint, fontSize: 11, lineHeight: 16, marginTop: 2 },
  createdRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  createdLabel: { color: Colors.textFaint, fontSize: 11, fontWeight: '700' },
  createdValue: { color: Colors.textMuted, fontSize: 12, marginRight: 10 },
  expired: { color: Colors.danger },
  error: { color: Colors.danger, fontSize: 13, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
});
