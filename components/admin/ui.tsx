import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

// Small building blocks shared by the admin dashboard and the listing form.

export function SectionCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AdminField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboard = 'default',
  maxLength,
  multiline = false,
  style,
  secure = false,
  autoFocus = false,
  onSubmitEditing,
}: {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboard?: 'default' | 'number-pad' | 'phone-pad';
  maxLength?: number;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
  secure?: boolean;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}) {
  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textFaint}
        keyboardType={keyboard}
        maxLength={maxLength}
        multiline={multiline}
        secureTextEntry={secure}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize={keyboard === 'default' ? 'sentences' : 'none'}
        accessibilityLabel={label ?? placeholder}
      />
    </View>
  );
}

export function AdminChip({
  label,
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
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export type BadgeTone = 'ok' | 'warn' | 'danger' | 'muted' | 'info';

export function Badge({ label, tone = 'muted' }: { label: string; tone?: BadgeTone }) {
  return (
    <View style={[styles.badge, badgeTone[tone]]}>
      <Text style={[styles.badgeText, badgeTextTone[tone]]}>{label}</Text>
    </View>
  );
}

export function AdminButton({
  label,
  onPress,
  tone = 'primary',
  small = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger' | 'ghost';
  small?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        buttonTone[tone],
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.45 },
        style,
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.buttonText, small && styles.buttonTextSmall, buttonTextTone[tone]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navyLight,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  field: { gap: 5 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.navy,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  inputMultiline: { minHeight: 120, textAlignVertical: 'top' },
  chip: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.amber, borderColor: Colors.amber },
  chipText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.navy, fontWeight: '800' },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  button: { height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonSmall: { height: 36, borderRadius: 11, paddingHorizontal: 12 },
  buttonText: { fontSize: 15, fontWeight: '900' },
  buttonTextSmall: { fontSize: 13, fontWeight: '800' },
});

const badgeTone: Record<BadgeTone, ViewStyle> = {
  ok: { backgroundColor: 'rgba(16,185,129,0.18)' },
  warn: { backgroundColor: 'rgba(255,176,32,0.18)' },
  danger: { backgroundColor: 'rgba(255,77,94,0.18)' },
  muted: { backgroundColor: 'rgba(255,255,255,0.10)' },
  info: { backgroundColor: 'rgba(59,130,246,0.18)' },
};

const badgeTextTone: Record<BadgeTone, { color: string }> = {
  ok: { color: '#10B981' },
  warn: { color: Colors.amber },
  danger: { color: Colors.danger },
  muted: { color: Colors.textMuted },
  info: { color: '#60A5FA' },
};

const buttonTone: Record<'primary' | 'secondary' | 'danger' | 'ghost', ViewStyle> = {
  primary: { backgroundColor: Colors.amber },
  secondary: { backgroundColor: Colors.navy, borderWidth: 1, borderColor: Colors.glassBorder },
  danger: { backgroundColor: Colors.danger },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.glassBorder },
};

const buttonTextTone: Record<'primary' | 'secondary' | 'danger' | 'ghost', { color: string }> = {
  primary: { color: Colors.navy },
  secondary: { color: Colors.white },
  danger: { color: Colors.white },
  ghost: { color: Colors.textMuted },
};
