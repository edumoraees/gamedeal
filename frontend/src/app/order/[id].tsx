import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, ErrorView, Header, LoadingView, Screen, Tag, Thumbnail } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/services/api';
import { orderService } from '@/services/orderService';
import { colors, fonts, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { confirmAction, showMessage } from '@/utils/dialog';
import { categoryLabels, formatDate, formatMoney, orderStatusLabels } from '@/utils/format';

/** Detalhe do pedido: recibo, confirmação de recebimento e acesso à avaliação. */
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const { data: order, loading, error, reload } = useApi(() => orderService.findById(Number(id)), [id], true);

  async function confirmReceipt() {
    const ok = await confirmAction(
      'Confirmar recebimento?',
      'O valor será liberado ao vendedor. Confirme apenas se você já recebeu o item ou serviço.',
      'Confirmar',
    );
    if (!ok) return;
    setConfirming(true);
    try {
      await orderService.confirmReceipt(Number(id));
      await reload();
    } catch (err) {
      showMessage('Não foi possível confirmar', errorMessage(err));
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return <Screen scroll={false}><LoadingView /></Screen>;
  if (error || !order) {
    return (
      <Screen scroll={false}>
        <Header title="Pedido" />
        <ErrorView message={error ?? 'Pedido não encontrado'} onRetry={reload} />
      </Screen>
    );
  }

  const isBuyer = user?.id === order.buyerId;

  return (
    <Screen
      footer={
        isBuyer && order.status === 'PAID' ? (
          <Button title="Confirmar recebimento" onPress={confirmReceipt} loading={confirming} />
        ) : isBuyer && order.status === 'COMPLETED' && !order.reviewed ? (
          <Button title="Avaliar vendedor" onPress={() => router.push(`/review/${order.id}`)} />
        ) : undefined
      }
    >
      <Header title={`Pedido #${order.id}`} />

      <Card style={styles.itemCard}>
        <Thumbnail uri={order.listingImage} size={72} />
        <View style={styles.flex}>
          <Tag label={order.gameName} />
          <Text style={typography.subtitle} numberOfLines={2}>
            {order.listingTitle}
          </Text>
          <Text style={typography.small}>
            {categoryLabels[order.category]} • {isBuyer ? `Vendedor: ${order.sellerName}` : `Comprador: ${order.buyerName}`}
          </Text>
        </View>
      </Card>

      <View style={styles.status}>
        <Tag
          label={orderStatusLabels[order.status]}
          tone={order.status === 'COMPLETED' ? 'success' : order.status === 'PAID' ? 'warning' : 'muted'}
        />
        <Text style={typography.small}>
          Comprado {formatDate(order.createdAt).toLowerCase()}
          {order.completedAt ? ` • concluído ${formatDate(order.completedAt).toLowerCase()}` : ''}
        </Text>
      </View>

      <Card style={styles.receipt}>
        <Row label={`Preço unitário × ${order.quantity}`} value={formatMoney(order.subtotal)} />
        <Row label="Taxa do cofre (2,5%)" value={formatMoney(order.serviceFee)} />
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL PAGO</Text>
          <Text style={styles.totalValue}>{formatMoney(order.total)}</Text>
        </View>
        {!isBuyer ? <Row label="Você recebe (após taxa de 10%)" value={formatMoney(order.sellerNet)} /> : null}
      </Card>

      {order.status === 'PAID' ? (
        <Text style={[typography.small, styles.hint]}>
          {isBuyer
            ? 'O pagamento está retido no cofre. Confirme o recebimento quando o vendedor entregar o item.'
            : 'Aguardando o comprador confirmar o recebimento para liberar o valor.'}
        </Text>
      ) : null}
      {order.reviewed ? <Text style={[typography.small, styles.hint]}>Você já avaliou este vendedor. Obrigado!</Text> : null}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={typography.muted}>{label}</Text>
      <Text style={typography.label}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  itemCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.lg },
  receipt: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: fonts.displayBlack, fontSize: 16, color: colors.text },
  totalValue: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.accent },
  hint: { marginTop: spacing.lg, textAlign: 'center' },
});
