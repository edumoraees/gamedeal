import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Minus, Plus, ShieldCheck, Trash2 } from 'lucide-react-native';
import { Button, Card, EmptyView, IconButton, PageTitle, Screen, Tag, Thumbnail } from '@/components';
import { useCart, type CartItem } from '@/contexts/CartContext';
import { errorMessage } from '@/services/api';
import { orderService } from '@/services/orderService';
import { colors, fonts, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { showMessage } from '@/utils/dialog';
import { formatMoney } from '@/utils/format';

/** Mesma taxa do order-service (app.service-fee-rate). O valor final cobrado vem do backend. */
const ESCROW_FEE = 0.025;

/** Carrinho / "The Vault Coffer": itens garantidos, recibo e finalização da compra. */
export default function CartScreen() {
  const { items, subtotal, setQuantity, remove } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const fee = Math.round(subtotal * ESCROW_FEE * 100) / 100;
  const total = subtotal + fee;

  async function checkout() {
    setSubmitting(true);
    const failures: string[] = [];
    let created = 0;

    // Um pedido por item: cada um reserva o estoque no catalog-service.
    for (const item of items) {
      try {
        await orderService.create(item.listing.id, item.quantity);
        remove(item.listing.id);
        created += 1;
      } catch (err) {
        failures.push(`${item.listing.title}: ${errorMessage(err)}`);
      }
    }
    setSubmitting(false);

    if (failures.length === 0) {
      showMessage('Compra realizada!', 'O pagamento ficou guardado no cofre até você confirmar o recebimento.');
      router.push('/orders');
    } else if (created > 0) {
      showMessage('Compra parcial', `Alguns itens não puderam ser comprados:\n\n${failures.join('\n')}`);
    } else {
      showMessage('Não foi possível finalizar', failures.join('\n'));
    }
  }

  return (
    <Screen
      footer={
        items.length > 0 ? (
          <Button title="Finalizar compra" uppercase onPress={checkout} loading={submitting} />
        ) : undefined
      }
    >
      <PageTitle title="Cofre de Compras" />

      {items.length === 0 ? (
        <EmptyView
          title="Seu cofre está vazio"
          message="Encontre skins, itens e mentorias na aba Início."
          action={<Button title="Explorar ofertas" size="sm" variant="outline" onPress={() => router.push('/listings')} />}
        />
      ) : (
        <>
          <Text style={[typography.section, styles.section]}>Itens garantidos</Text>
          <View style={styles.list}>
            {items.map((item) => (
              <CartRow
                key={item.listing.id}
                item={item}
                onRemove={() => remove(item.listing.id)}
                onChange={(q) => setQuantity(item.listing.id, q)}
              />
            ))}
          </View>

          <Text style={[typography.section, styles.section]}>Recibo da transação</Text>
          <Card style={styles.receipt}>
            <ReceiptRow label="Subtotal" value={formatMoney(subtotal)} />
            <ReceiptRow label="Taxa do cofre (2,5%)" value={formatMoney(fee)} />
            <ReceiptRow label="Transferência segura" value="GRÁTIS" valueColor={colors.accent} />
            <View style={styles.dashed} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
              <Text style={styles.totalValue}>{formatMoney(total)}</Text>
            </View>
          </Card>

          <View style={styles.note}>
            <ShieldCheck color={colors.success} size={20} />
            <Text style={[typography.small, styles.noteText]}>
              O cofre retém o pagamento. O valor só é liberado ao vendedor depois que você confirmar o recebimento do item.
            </Text>
          </View>
        </>
      )}
    </Screen>
  );
}

function CartRow({ item, onRemove, onChange }: { item: CartItem; onRemove: () => void; onChange: (q: number) => void }) {
  const { listing, quantity } = item;
  return (
    <Card style={styles.row}>
      <Pressable onPress={() => router.push(`/listing/${listing.id}`)}>
        <Thumbnail uri={listing.images[0]} size={76} />
      </Pressable>
      <View style={styles.rowInfo}>
        <Tag label={listing.game.name} />
        <Text style={typography.subtitle} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={typography.small}>Vendedor: {listing.sellerName}</Text>
        <View style={styles.rowBottom}>
          <Text style={styles.rowPrice}>{formatMoney(listing.price * quantity)}</Text>
          {listing.quantity > 1 ? (
            <View style={styles.stepper}>
              <Pressable onPress={() => onChange(quantity - 1)} hitSlop={8} accessibilityLabel="Diminuir quantidade">
                <Minus color={colors.text} size={16} />
              </Pressable>
              <Text style={typography.label}>{quantity}</Text>
              <Pressable
                onPress={() => onChange(quantity + 1)}
                hitSlop={8}
                disabled={quantity >= listing.quantity}
                accessibilityLabel="Aumentar quantidade"
              >
                <Plus color={quantity >= listing.quantity ? colors.border : colors.text} size={16} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
      <IconButton label="Remover do carrinho" onPress={onRemove} size={32}>
        <Trash2 color={colors.pink} size={16} />
      </IconButton>
    </Card>
  );
}

function ReceiptRow({ label, value, valueColor = colors.text }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={typography.muted}>{label}</Text>
      <Text style={[typography.label, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg, marginBottom: spacing.md },
  list: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowInfo: { flex: 1, gap: 3 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowPrice: { fontFamily: fonts.displayBlack, fontSize: 16, color: colors.pink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  receipt: { gap: spacing.md },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dashed: { borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontFamily: fonts.displayBlack, fontSize: 16, color: colors.text },
  totalValue: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.accent },
  note: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, alignItems: 'flex-start' },
  noteText: { flex: 1 },
});
