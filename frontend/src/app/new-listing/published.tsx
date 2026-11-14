import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Button, Screen } from '@/components';
import { colors, fonts, glow, spacing } from '@/theme';
import { typography } from '@/theme/typography';

/** Etapa 4 do anúncio: confirmação "Anúncio Publicado!". */
export default function PublishedScreen() {
  const { id, edited } = useLocalSearchParams<{ id: string; edited?: string }>();

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <>
          <Button title="Ver Meu Anúncio" onPress={() => router.replace(`/listing/${id}`)} />
          <Button title="Criar Outro Anúncio" variant="outline" onPress={() => router.replace('/new-listing/category')} />
        </>
      }
      contentStyle={styles.content}
    >
      <View style={styles.circle}>
        <Check color={colors.onAccent} size={36} strokeWidth={3} />
      </View>
      <Text style={styles.title}>{edited ? 'Anúncio Atualizado!' : 'Anúncio Publicado!'}</Text>
      <Text style={[typography.muted, styles.text]}>
        Seu item já está ativo e visível para todos os compradores no GameDeal.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...glow,
  },
  title: { fontFamily: fonts.displayBlack, fontSize: 26, color: colors.text, marginTop: spacing.md },
  text: { textAlign: 'center', paddingHorizontal: spacing.xxl },
});
