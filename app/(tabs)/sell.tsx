import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react-native';
import ConsentCheck from '../../components/ConsentCheck';
import LegalSheet from '../../components/LegalSheet';
import { CITIES } from '../../constants/cities';
import { Colors } from '../../constants/colors';
import { ADMIN_CONTACTS, LISTING_LIFETIME_DAYS } from '../../constants/config';
import { LEGAL_UPDATED, type LegalDocId } from '../../constants/legal';
import { label } from '../../constants/i18n';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useLang } from '../../context/LanguageContext';
import type { City, Condition, DealType, Documents, PropertyType, SellerType, Series } from '../../types/listing';
import { formatArea, formatPhone, formatSotka, priceLabel } from '../../utils/format';
import { fullKgPhone, isValidKgPhone } from '../../utils/phone';

const DEAL_TYPES: DealType[] = ['sale', 'rent'];
const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'dacha', 'land', 'commercial'];
const CONDITIONS: Condition[] = ['euro', 'good', 'cosmetic', 'pso'];
const DOCUMENT_OPTIONS: Documents[] = ['redBook', 'ddu', 'none'];
const SERIES_OPTIONS: Series[] = ['104', '105', '106', 'elite', 'khrushchevka', 'stalinka', 'individual'];
const SELLER_TYPES: SellerType[] = ['owner', 'agent'];

type FormError = 'fields' | 'details' | 'phone' | 'consent' | 'open' | null;

// Listings are posted by the administrator. The form does not upload anything:
// it composes a structured Russian message and opens the admin's WhatsApp, where
// the seller attaches the photos. This keeps the prototype free and backend-less
// while giving the admin clean real-estate data instead of a free-form chat.
export default function SellScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useLang();
  const { user } = useAuth();
  const { currency } = useCurrency();

  const [dealType, setDealType] = useState<DealType>('sale');
  const [type, setType] = useState<PropertyType | null>(null);
  const [rooms, setRooms] = useState<number | null>(null);
  const [area, setArea] = useState('');
  const [sotka, setSotka] = useState('');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [year, setYear] = useState('');
  const [series, setSeries] = useState<Series | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [documents, setDocuments] = useState<Documents | null>(null);
  const [furnished, setFurnished] = useState(false);
  const [city, setCity] = useState<City | null>(null);
  const [district, setDistrict] = useState('');
  const [price, setPrice] = useState('');
  const [sellerType, setSellerType] = useState<SellerType | null>(null);
  const [phone, setPhone] = useState('+996 ');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const [preview, setPreview] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);
  const phoneTouched = useRef(false);

  // Prefill the signed-in account's number once, without overwriting edits.
  useEffect(() => {
    if (user && !phoneTouched.current) setPhone(formatPhone(user.phone));
  }, [user]);

  const priceNum = Number(price.replace(/\D/g, ''));
  const areaNum = Number(area.replace(/\D/g, ''));
  const sotkaNum = Number(sotka.replace(/\D/g, ''));

  // Only the fields that make sense for the chosen property type are shown and sent.
  const showRooms = type === 'apartment' || type === 'house' || type === 'dacha';
  const showSotka = type === 'house' || type === 'dacha' || type === 'land';
  const showFloor = type === 'apartment' || type === 'commercial';
  const showCondition = type !== null && type !== 'land';
  const showSeries = type === 'apartment';
  const isLand = type === 'land';
  const roomChips = type === 'apartment' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4];

  // The admin reads Russian; the field labels follow the UI language.
  const message = useMemo(() => {
    const roomText =
      rooms === null
        ? '—'
        : rooms === 0
          ? t('sell.roomStudio')
          : rooms === 4
            ? t('sell.room4')
            : String(rooms);
    const floorText =
      showFloor && floor.trim() ? `${floor.trim()}${totalFloors.trim() ? `/${totalFloors.trim()}` : ''}` : '—';
    const lines = [
      'InstaHouse — заявка на объявление',
      '',
      `Тип сделки: ${label.dealType(lang, dealType)}`,
      `Объект: ${type ? label.type(lang, type) : '—'}`,
      `Комнат: ${showRooms ? roomText : '—'}`,
      `Площадь: ${areaNum > 0 ? formatArea(areaNum) : '—'}`,
      `Участок: ${showSotka && sotkaNum > 0 ? formatSotka(sotkaNum, lang) : '—'}`,
      `Этаж: ${floorText}`,
      `Год: ${year.trim() || '—'}`,
      `Серия: ${showSeries && series ? label.series(lang, series) : '—'}`,
      `Состояние: ${showCondition && condition ? label.condition(lang, condition) : '—'}`,
      `Документы: ${documents ? label.documents(lang, documents) : '—'}`,
      `Мебель: ${showCondition ? (furnished ? t('sell.furnishedYes') : t('sell.furnishedNo')) : '—'}`,
      `Город: ${city ? label.city(lang, city) : '—'}`,
      `Район: ${district.trim() || '—'}`,
      `Цена: ${
        priceNum > 0
          ? `${priceLabel({ dealType }, priceNum, lang, 'usd')} (${priceLabel({ dealType }, priceNum, lang, 'som')})`
          : '—'
      }`,
      `Продавец: ${sellerType ? label.sellerType(lang, sellerType) : '—'}`,
      `Телефон/WhatsApp: ${formatPhone(fullKgPhone(phone))}`,
      '',
      `Согласие: Политика конфиденциальности и Пользовательское соглашение приняты (${LEGAL_UPDATED}).`,
      'Фото: добавляю в этот чат (3–10 шт.).',
    ];
    return lines.join('\n');
  }, [
    areaNum,
    city,
    condition,
    dealType,
    district,
    documents,
    floor,
    furnished,
    lang,
    priceNum,
    rooms,
    sellerType,
    series,
    showCondition,
    showFloor,
    showRooms,
    showSeries,
    showSotka,
    sotkaNum,
    t,
    totalFloors,
    type,
    year,
    phone,
  ]);

  const validate = (): FormError => {
    if (!type) return 'fields';
    if (!areaNum || areaNum <= 0) return 'fields';
    if (!priceNum || priceNum <= 0) return 'fields';
    if (!city) return 'fields';
    const yearNum = Number(year);
    if (year.trim() && (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 2)) {
      return 'fields';
    }
    if (showFloor && floor.trim() && (!Number.isInteger(Number(floor)) || Number(floor) < 1)) return 'fields';
    if (showFloor && totalFloors.trim() && (!Number.isInteger(Number(totalFloors)) || Number(totalFloors) < 1)) {
      return 'fields';
    }
    if (showRooms && rooms === null) return 'details';
    if (isLand && !sotkaNum) return 'details';
    if (showCondition && !condition) return 'details';
    if (!documents) return 'details';
    if (!sellerType) return 'details';
    if (!isValidKgPhone(phone)) return 'phone';
    if (!consent) return 'consent';
    return null;
  };

  const open = (url: string) => Linking.openURL(url).catch(() => setError('open'));

  const send = () => {
    const next = validate();
    if (next) {
      setError(next);
      return;
    }
    setError(null);
    const digits = ADMIN_CONTACTS.whatsappPhone.replace(/\D/g, '');
    open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`);
  };

  const errorText =
    error === 'fields'
      ? t('sell.formInvalid')
      : error === 'details'
        ? t('sell.details')
        : error === 'phone'
          ? t('auth.phoneInvalid')
          : error === 'consent'
            ? t('sell.consentRequired')
            : error === 'open'
              ? t('sell.openError')
              : null;

  const somPreview = priceNum > 0 ? priceLabel({ dealType }, priceNum, lang, 'som') : '';
  const previewAccent = currency === 'som';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{t('sell.title')}</Text>
        <Text style={styles.sub}>{t('sell.sub')}</Text>

        <View style={styles.banner}>
          <ShieldCheck size={18} color={Colors.amber} />
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>{t('sell.adminTitle')}</Text>
            <Text style={styles.bannerText}>{t('sell.adminText')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('sell.formTitle')}</Text>
          <Text style={styles.cardHint}>{t('sell.formText')}</Text>

          <Text style={styles.label}>{t('sell.dealTypeLabel')}</Text>
          <View style={styles.segment}>
            {DEAL_TYPES.map((d) => (
              <Pressable
                key={d}
                onPress={() => {
                  setDealType(d);
                  setError(null);
                }}
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
              <OptionChip
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
                  <OptionChip
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
            <Field
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
              <Field
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
              <Field
                label={t('sell.floor')}
                value={floor}
                onChangeText={(v) => {
                  setFloor(v);
                  setError(null);
                }}
                keyboard="number-pad"
                placeholder="5"
                maxLength={3}
                style={styles.flex}
              />
              <Field
                label={t('sell.totalFloors')}
                value={totalFloors}
                onChangeText={(v) => {
                  setTotalFloors(v);
                  setError(null);
                }}
                keyboard="number-pad"
                placeholder="9"
                maxLength={3}
                style={styles.flex}
              />
            </View>
          )}

          <View style={styles.row}>
            <Field
              label={t('sell.year')}
              value={year}
              onChangeText={(v) => {
                setYear(v);
                setError(null);
              }}
              keyboard="number-pad"
              placeholder="2019"
              maxLength={4}
              style={styles.flex}
            />
          </View>

          {showSeries && (
            <>
              <Text style={styles.label}>{t('sell.series')}</Text>
              <View style={styles.chips}>
                {SERIES_OPTIONS.map((s) => (
                  <OptionChip
                    key={s}
                    label={label.series(lang, s)}
                    active={series === s}
                    onPress={() => setSeries(series === s ? null : s)}
                  />
                ))}
              </View>
              <Text style={styles.hint}>{t('sell.seriesHint')}</Text>
            </>
          )}

          {showCondition && (
            <>
              <Text style={styles.label}>{t('sell.condition')}</Text>
              <View style={styles.chips}>
                {CONDITIONS.map((c) => (
                  <OptionChip
                    key={c}
                    label={label.condition(lang, c)}
                    active={condition === c}
                    onPress={() => {
                      setCondition(condition === c ? null : c);
                      setError(null);
                    }}
                  />
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>{t('sell.documents')}</Text>
          <View style={styles.chips}>
            {DOCUMENT_OPTIONS.map((d) => (
              <OptionChip
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

          {showCondition && (
            <>
              <Text style={styles.label}>{t('sell.furnished')}</Text>
              <View style={styles.chips}>
                <OptionChip
                  label={t('sell.furnishedYes')}
                  active={furnished}
                  onPress={() => setFurnished(true)}
                />
                <OptionChip
                  label={t('sell.furnishedNo')}
                  active={!furnished}
                  onPress={() => setFurnished(false)}
                />
              </View>
            </>
          )}

          <Text style={styles.label}>{t('filter.city')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityRow}
          >
            {CITIES.map((c) => (
              <OptionChip
                key={c}
                label={label.city(lang, c)}
                active={city === c}
                onPress={() => {
                  setCity(c);
                  setError(null);
                }}
              />
            ))}
          </ScrollView>

          <Field
            label={t('sell.district')}
            value={district}
            onChangeText={setDistrict}
            placeholder="Центр, ул. Киевская"
            maxLength={60}
          />

          <Field
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
          {somPreview !== '' && (
            <Text style={[styles.pricePreview, previewAccent && styles.pricePreviewAccent]}>
              {t('sell.pricePreview', { value: somPreview })}
            </Text>
          )}

          <Text style={styles.label}>{t('sell.sellerType')}</Text>
          <View style={styles.chips}>
            {SELLER_TYPES.map((s) => (
              <OptionChip
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

          <Field
            label={t('sell.phone')}
            value={phone}
            onChangeText={(v) => {
              phoneTouched.current = true;
              setPhone(v);
              setError(null);
            }}
            keyboard="phone-pad"
            placeholder={t('sell.phoneHint')}
            maxLength={20}
          />

          <ConsentCheck
            checked={consent}
            onToggle={() => {
              setConsent((v) => !v);
              if (error === 'consent') setError(null);
            }}
            text={t('sell.consent')}
            onPrivacy={() => setLegalDoc('privacy')}
            onTerms={() => setLegalDoc('terms')}
          />

          {errorText && <Text style={styles.error}>{errorText}</Text>}

          <Pressable
            style={styles.previewToggle}
            onPress={() => setPreview((v) => !v)}
            accessibilityRole="button"
          >
            <Text style={styles.previewLabel}>{t('sell.preview')}</Text>
            {preview ? (
              <ChevronUp size={18} color={Colors.amber} />
            ) : (
              <ChevronDown size={18} color={Colors.amber} />
            )}
          </Pressable>
          {preview && (
            <View style={styles.bubble}>
              <Text style={styles.bubbleText} selectable>
                {message}
              </Text>
            </View>
          )}

          <Pressable style={styles.send} onPress={send} accessibilityRole="button">
            <MessageCircle size={20} color={Colors.white} strokeWidth={2.6} />
            <Text style={styles.sendText}>{t('sell.send')}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Camera size={18} color={Colors.amber} />
            <Text style={styles.cardTitle}>{t('sell.photoGuideTitle')}</Text>
          </View>
          <Text style={styles.cardHint}>{t('sell.photoGuideText')}</Text>
        </View>

        <View style={styles.rules}>
          <View style={styles.rulesHeader}>
            <AlertTriangle size={18} color={Colors.amber} />
            <Text style={styles.rulesTitle}>{t('sell.rulesTitle')}</Text>
          </View>
          <Rule icon={<Clock size={16} color={Colors.amber} />} text={t('sell.rule15', { n: LISTING_LIFETIME_DAYS })} />
          <Rule icon={<Camera size={16} color={Colors.amber} />} text={t('sell.rulePhotos')} />
          <Rule icon={<ShieldCheck size={16} color={Colors.amber} />} text={t('sell.ruleHonest')} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('sell.other')}</Text>
          <Pressable
            style={[styles.contact, { backgroundColor: '#2AABEE' }]}
            onPress={() => open(ADMIN_CONTACTS.telegram)}
            accessibilityRole="button"
          >
            <Send size={20} color={Colors.white} strokeWidth={2.4} />
            <Text style={[styles.contactText, { color: Colors.white }]}>Telegram</Text>
          </Pressable>
          <Pressable
            style={[styles.contact, { backgroundColor: Colors.amber }]}
            onPress={() =>
              open(`mailto:${ADMIN_CONTACTS.email}?subject=InstaHouse&body=${encodeURIComponent(message)}`)
            }
            accessibilityRole="button"
          >
            <Mail size={20} color={Colors.navy} strokeWidth={2.4} />
            <Text style={[styles.contactText, { color: Colors.navy }]}>E-mail</Text>
          </Pressable>
        </View>
      </ScrollView>

      <LegalSheet doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </KeyboardAvoidingView>
  );
}

function Field({
  label: text,
  value,
  onChangeText,
  keyboard = 'default',
  placeholder,
  maxLength,
  style,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboard?: 'default' | 'number-pad' | 'phone-pad';
  placeholder?: string;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{text}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboard}
        placeholder={placeholder}
        placeholderTextColor={Colors.textFaint}
        maxLength={maxLength}
        autoCapitalize={keyboard === 'default' ? 'words' : 'none'}
        accessibilityLabel={text}
      />
    </View>
  );
}

function OptionChip({
  label: text,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        active && styles.optionActive,
        pressed && { opacity: 0.8 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.optionText, active && styles.optionTextActive]}>{text}</Text>
    </Pressable>
  );
}

function Rule({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.rule}>
      {icon}
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navy },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  flex: { flex: 1 },
  heading: { color: Colors.white, fontSize: 28, fontWeight: '900' },
  sub: { color: Colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: -6 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,176,32,0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.35)',
  },
  bannerTitle: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  bannerText: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  cardHint: { color: Colors.textFaint, fontSize: 12, lineHeight: 17 },
  row: { flexDirection: 'row', gap: 8 },
  field: { gap: 5 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 2 },
  hint: { color: Colors.textFaint, fontSize: 11, marginTop: -4 },
  input: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.navy,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityRow: { gap: 8, paddingRight: 4 },
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
  option: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
  optionText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  optionTextActive: { color: Colors.navy, fontWeight: '800' },
  pricePreview: { color: Colors.textFaint, fontSize: 12, fontWeight: '600', marginTop: -4 },
  pricePreviewAccent: { color: Colors.amber },
  error: { color: Colors.danger, fontSize: 13 },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  previewLabel: { color: Colors.amber, fontSize: 13, fontWeight: '800' },
  bubble: {
    backgroundColor: 'rgba(37,211,102,0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.35)',
    padding: 12,
  },
  bubbleText: { color: Colors.white, fontSize: 13, lineHeight: 19 },
  send: {
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.whatsapp,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 2,
  },
  sendText: { color: Colors.white, fontWeight: '900', fontSize: 17 },
  rules: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(255,176,32,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,176,32,0.5)',
  },
  rulesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rulesTitle: { color: Colors.amber, fontWeight: '900', fontSize: 15, letterSpacing: 0.3 },
  rule: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  ruleText: { color: Colors.white, flex: 1, lineHeight: 20, fontSize: 14 },
  contact: {
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contactText: { fontSize: 16, fontWeight: '800' },
});
