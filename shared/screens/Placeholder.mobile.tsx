// Phone override of `Placeholder.tsx` (temporary, see that file).
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function Placeholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StreamShelf</Text>
      <Text style={styles.body}>
        Mobile build · {Platform.OS} · isTV={String(Platform.isTV)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' },
  title: { color: 'white', fontSize: 32, fontWeight: '700' },
  body: { color: 'white', fontSize: 16, marginTop: 8 },
});
