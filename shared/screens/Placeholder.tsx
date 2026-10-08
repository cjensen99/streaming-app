// Temporary Phase 2 screen, replaced by the real navigator in Phase 7. It exists to prove that
// both apps resolve `@app/shared` and that the phone app picks up `.mobile.tsx` overrides.
// Named colours are a stopgap until the design tokens in `shared/ui/` land (Phase 6).
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function Placeholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StreamShelf</Text>
      <Text style={styles.body}>
        TV build · {Platform.OS} · isTV={String(Platform.isTV)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' },
  title: { color: 'white', fontSize: 64, fontWeight: '700' },
  body: { color: 'white', fontSize: 32, marginTop: 16 },
});
