import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { CURRENCIES, useCurrency, type Currency } from '../context/CurrencyContext';
import { useLang } from '../context/LanguageContext';

const LABEL: Record<Currency, string> = { usd: '$', som: 'сом' };

// Sits next to the language switch. The choice is remembered on this device.
export default function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency();
  const { lang } = useLang();
  const som = lang === 'tr' ? 'som' : LABEL.som;

  return (
    <View style={styles.row}>
      {CURRENCIES.map((c) => (
        <Pressable
          key={c}
          onPress={() => setCurrency(c)}
          style={[styles.chip, c === currency && styles.chipActive]}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityState={{ selected: c === currency }}
          accessibilityLabel={c === 'usd' ? 'Dollar' : 'Som'}
        >
          <Text style={[styles.text, c === currency && styles.textActive]}>{c === 'som' ? som : LABEL.usd}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.glass,
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  chipActive: { backgroundColor: Colors.amber },
  text: { color: Colors.textMuted, fontSize: 11, fontWeight: '800' },
  textActive: { color: Colors.navy },
});
