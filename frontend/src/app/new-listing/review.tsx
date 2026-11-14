import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Header, Screen, Thumbnail } from '@/components';
import { useNewListing } from '@/contexts/NewListingContext';
import { errorMessage } from '@/services/api';
import { catalogService } from '@/services/catalogService';
import { colors, fonts, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { showMessage } from '@/utils/dialog';
import { categoryLabels, formatMoney, parseMoneyInput } from '@/utils/format';

const PLATFORM_FEE = 0.1;

/** Etapa 3 do anúncio: "Revisar Anúncio" com a taxa da plataforma (10%) e o valor líquido. */
export default function ReviewListingScreen() {
  const { draft, toInput } = useNewListing();
  const [publishing, setPublishing] = useState(false);

  const price = parseMoneyInput(draft.priceText);
  const quantity = Number(draft.quantityText);
  const fee = Math.round(price * PLATFORM_FEE * 100) / 100;

  async function publish() {
    setPublishing(true);
    try {
      const input = toInput(price, quantity);
      const saved = draft.editId
        ? await catalogService.update(draft.editId, input)
        : await catalogService.create(input);
      router.replace({ pathname: '/new-listing/published', params: { id: String(saved.id), edited: draft.editId ? '1' : '' } });
    } catch (err) {
      showMessage('Não foi possível publicar', errorMessage(err));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <Screen
      footer={
        <>
          <Button title={draft.editId ? 'Salvar alterações' : 'Publicar Anúncio'} onPress={publish} loading={publishing} />
          <Button title="Editar Anúncio" variant="outline" onPress={() => router.back()} disabled={publishing} />
        </>
      }
    >
      <Header title="Revisar Anúncio" />

      <Card style={styles.preview}>
        <Thumbnail uri={draft.images[0]} width="100%" height={150} rounded={0} />
        <View style={styles.previewInfo}>
          <Text style={typography.title}>{draft.title}</Text>
          <Text style={typography.muted}>
            {draft.game?.name} • {draft.category ? categoryLabels[draft.category] : ''}
            {draft.subcategory ? ` • ${draft.subcategory}` : ''}
          </Text>
          <Text style={typography.muted} numberOfLines={3}>
            {draft.description}
          </Text>
          <Text style={styles.price}>
            {formatMoney(price)} <Text style={typography.small}>• {quantity} un.</Text>
          </Text>
        </View>
      </Card>

      <Card style={styles.fees}>
        <View style={styles.feeRow}>
          <Text style={typography.muted}>Taxa da plataforma (10%)</Text>
          <Text style={typography.label}>{formatMoney(fee)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.feeRow}>
          <Text style={styles.receiveLabel}>Você recebe (por unidade):</Text>
          <Text style={styles.receiveValue}>{formatMoney(price - fee)}</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { padding: 0, overflow: 'hidden', borderRadius: radius.xl },
  previewInfo: { padding: spacing.lg, gap: spacing.sm },
  price: { fontFamily: fonts.displayBlack, fontSize: 16, color: colors.accent },
  fees: { marginTop: spacing.lg, gap: spacing.md },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: 1, backgroundColor: colors.border },
  receiveLabel: { fontFamily: fonts.displayExtraBold, fontSize: 15, color: colors.text },
  receiveValue: { fontFamily: fonts.displayBlack, fontSize: 16, color: colors.accent },
});
