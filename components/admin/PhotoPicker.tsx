import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { PHOTO_FILES, photoLibraryUri } from '../../constants/photos';
import { useLang } from '../../context/LanguageContext';
import { AdminButton, AdminField } from './ui';

interface Props {
  photos: string[];
  onChange: (next: string[]) => void;
  libraryTitle?: string;
}

// Library thumbnails + a URL input. There is no upload backend yet, so the admin
// composes the gallery from the bundled photos or any public image URL.
export default function PhotoPicker({ photos, onChange, libraryTitle }: Props) {
  const { t } = useLang();
  const [url, setUrl] = useState('');

  const toggle = (uri: string) => {
    onChange(photos.includes(uri) ? photos.filter((p) => p !== uri) : [...photos, uri]);
  };

  const addUrl = () => {
    const next = url.trim();
    if (!/^https?:\/\//i.test(next)) return;
    if (!photos.includes(next)) onChange([...photos, next]);
    setUrl('');
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('admin.form.photos')}</Text>
      <Text style={styles.hint}>{t('admin.form.photosHint')}</Text>

      {photos.length > 0 && (
        <View style={styles.selectedRow}>
          {photos.map((uri, index) => (
            <View key={uri} style={styles.selected}>
              <Image source={{ uri }} style={styles.selectedImage} contentFit="cover" />
              <View style={styles.order}>
                <Text style={styles.orderText}>{index + 1}</Text>
              </View>
              <Pressable
                style={styles.remove}
                onPress={() => onChange(photos.filter((p) => p !== uri))}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="remove"
              >
                <X size={12} color={Colors.white} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.label}>{libraryTitle ?? t('admin.form.photoLibrary')}</Text>
      <View style={styles.library}>
        {PHOTO_FILES.map((file) => {
          const uri = photoLibraryUri(file);
          const index = photos.indexOf(uri);
          return (
            <Pressable
              key={file}
              onPress={() => toggle(uri)}
              style={[styles.thumb, index >= 0 && styles.thumbActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: index >= 0 }}
              accessibilityLabel={file}
            >
              <Image source={{ uri }} style={styles.thumbImage} contentFit="cover" />
              {index >= 0 && (
                <View style={styles.check}>
                  <Text style={styles.checkText}>{index + 1}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.urlRow}>
        <AdminField
          value={url}
          onChangeText={setUrl}
          placeholder={t('admin.form.urlPlaceholder')}
          label={t('admin.form.addUrl')}
          onSubmitEditing={addUrl}
          style={styles.urlField}
        />
        <View style={styles.urlButton}>
          <AdminButton label={t('admin.form.add')} onPress={addUrl} tone="secondary" />
        </View>
      </View>
      <Text style={styles.counter}>{t('admin.form.photosSelected', { n: photos.length })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  hint: { color: Colors.textFaint, fontSize: 11, marginTop: -3 },
  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selected: { width: 76, height: 76, borderRadius: 10, overflow: 'hidden', backgroundColor: Colors.navy },
  selectedImage: { width: '100%', height: '100%' },
  order: {
    position: 'absolute',
    left: 4,
    top: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  orderText: { color: Colors.navy, fontSize: 10, fontWeight: '900' },
  remove: {
    position: 'absolute',
    right: 3,
    top: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  library: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.navy,
  },
  thumbActive: { borderColor: Colors.amber },
  thumbImage: { width: '100%', height: '100%' },
  check: {
    position: 'absolute',
    right: 2,
    top: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  checkText: { color: Colors.navy, fontSize: 10, fontWeight: '900' },
  urlRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  urlField: { flex: 1 },
  urlButton: { paddingBottom: 0 },
  counter: { color: Colors.textFaint, fontSize: 11 },
});
