// Temporary Phase 2 screen, replaced by the real navigator in Phase 7. It exists to prove that
// both apps resolve `@app/shared` and that the phone app picks up `.mobile.tsx` overrides.
// Named colours are a stopgap until the design tokens in `shared/ui/` land (Phase 6).
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useHomeRails } from '../hooks/useHomeRails';

export default function Placeholder() {
  // Temporary (Phase 4): proves real data loads on device. Phase 7 replaces this screen.
  const rails = useHomeRails();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StreamShelf</Text>
      <Text style={styles.body}>
        TV build · {Platform.OS} · isTV={String(Platform.isTV)}
      </Text>
      {rails.map(({ config, rail, isLoading, error }) => (
        <Text key={config.id} style={styles.body}>
          {config.title}:{' '}
          {isLoading
            ? 'loading…'
            : error
              ? `error (${error.kind})`
              : `${rail?.items.length ?? 0} channels`}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' },
  title: { color: 'white', fontSize: 64, fontWeight: '700' },
  body: { color: 'white', fontSize: 32, marginTop: 16 },
});
