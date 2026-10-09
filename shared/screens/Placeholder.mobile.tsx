// Phone override of `Placeholder.tsx` (temporary, see that file).
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useHomeRails } from '../hooks/useHomeRails';

export default function Placeholder() {
  // Temporary (Phase 4): proves real data loads on device. Phase 7 replaces this screen.
  const rails = useHomeRails();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StreamShelf</Text>
      <Text style={styles.body}>
        Mobile build · {Platform.OS} · isTV={String(Platform.isTV)}
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
  title: { color: 'white', fontSize: 32, fontWeight: '700' },
  body: { color: 'white', fontSize: 16, marginTop: 8 },
});
