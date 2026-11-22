import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useLang } from '../../context/LanguageContext';
import { isListingArray } from '../../services/listingStore';
import type { Listing } from '../../types/listing';
import { AdminButton } from './ui';

interface Props {
  mode: 'export' | 'import' | null;
  listings: Listing[];
  onClose: () => void;
  onImport: (listings: Listing[]) => void;
}

// The catalogue lives on one device for now, so a JSON copy/paste is the way to
// back it up or move it between the laptop and the phone.
export default function AdminTransfer({ mode, listings, onClose, onImport }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState(false);

  const json = useMemo(() => JSON.stringify(listings, null, 2), [listings]);

  const copy = async () => {
    if (Platform.OS === 'web') {
      const nav = globalThis.navigator as { clipboard?: { writeText: (s: string) => Promise<void> } } | undefined;
      try {
        await nav?.clipboard?.writeText(json);
        setCopied(true);
      } catch {
        setCopied(false);
      }
      return;
    }
    try {
      await Share.share({ message: json });
    } catch {
      /* cancelled */
    }
  };

  const applyImport = () => {
    try {
      const parsed: unknown = JSON.parse(text);
      if (!isListingArray(parsed)) {
        setError(true);
        return;
      }
      onImport(parsed);
      setText('');
      setError(false);
      onClose();
    } catch {
      setError(true);
    }
  };

  return (
    <Modal visible={mode !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 14 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'import' ? t('admin.importTitle') : t('admin.exportTitle')}
            </Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('common.close')}>
              <X size={22} color={Colors.textMuted} />
            </Pressable>
          </View>

          {mode === 'import' ? (
            <>
              <Text style={styles.body}>{t('admin.importText')}</Text>
              <TextInput
                style={styles.textarea}
                value={text}
                onChangeText={(v) => {
                  setText(v);
                  if (error) setError(false);
                }}
                multiline
                placeholder='[{"id": "…"}]'
                placeholderTextColor={Colors.textFaint}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={t('admin.importTitle')}
              />
              {error && <Text style={styles.error}>{t('admin.importInvalid')}</Text>}
              <AdminButton
                label={t('admin.importReplace')}
                onPress={applyImport}
                disabled={text.trim().length === 0}
              />
            </>
          ) : (
            <>
              <Text style={styles.body}>{t('admin.exportText')}</Text>
              <ScrollView style={styles.jsonBox} contentContainerStyle={styles.jsonContent}>
                <Text style={styles.json} selectable>
                  {json}
                </Text>
              </ScrollView>
              <AdminButton
                label={
                  Platform.OS === 'web'
                    ? copied
                      ? t('admin.copied')
                      : t('admin.copy')
                    : t('admin.share')
                }
                onPress={copy}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '92%',
    backgroundColor: Colors.navyLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: Colors.white, fontSize: 19, fontWeight: '900', flex: 1 },
  body: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  textarea: {
    minHeight: 180,
    maxHeight: 320,
    borderRadius: 12,
    padding: 12,
    backgroundColor: Colors.navy,
    color: Colors.white,
    fontSize: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    textAlignVertical: 'top',
  },
  error: { color: Colors.danger, fontSize: 13 },
  jsonBox: {
    maxHeight: 340,
    borderRadius: 12,
    backgroundColor: Colors.navy,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  jsonContent: { padding: 12 },
  json: { color: Colors.textMuted, fontSize: 11, lineHeight: 16 },
});
