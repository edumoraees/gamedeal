import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Share2 } from 'lucide-react-native';
import { Button, Card, Chip, ErrorView, Header, IconButton, LoadingView, Screen, Tag, Thumbnail } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useApi } from '@/hooks/useApi';
import { catalogService } from '@/services/catalogService';
import { orderService } from '@/services/orderService';
import { colors, fonts, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { categoryLabels, formatMoney, listingStatusLabels } from '@/utils/format';
import { showMessage } from '@/utils/dialog';

/** Moedas para exibição: a conversão é feita pelo currency-service (via catalog-service). */
const currencies = [
  { code: 'BRL', label: 'R$' },
  { code: 'USD', label: 'US$' },
  { code: 'EUR', label: '€' },
];

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = Number(id);
  const { user } = useAuth();
  const cart = useCart();
  const [currency, setCurrency] = useState('BRL');

  const { data: listing, loading, error, reload } = useApi(
    () => catalogService.findById(listingId, currency),
    [listingId, currency],
  );
  const seller = useApi(
    () => (listing ? orderService.sellerSummary(listing.sellerId) : Promise.resolve(undefined)),
    [listing?.sellerId],
  );

  if (loading && !listing) return <Screen scroll={false}><LoadingView /></Screen>;
  if (error || !listing) {
    return (
      <Screen scroll={false}>
        <Header title="Detalhe da compra" roundBack />
        <ErrorView message={error ?? 'Anúncio não encontrado'} onRetry={reload} />
      </Screen>
    );
  }

  const isOwner = user?.id === listing.sellerId;
  const available = listing.status === 'ACTIVE' && listing.quantity > 0;
  const converted = listing.displayCurrency !== 'BRL';

  function buyNow() {
    if (!listing) return;
    cart.add(listing, 1);
    router.push('/cart');
  }

  async function share() {
    if (!listing) return;
    try {
      await Share.share({
        message: `${listing.title} por ${formatMoney(listing.price)} no GameDeal!`,
      });
    } catch {
      // usuário cancelou
    }
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <View>
            <Text style={typography.small}>Preço total</Text>
            <Text style={styles.totalPrice}>{formatMoney(listing.displayPrice, listing.displayCurrency)}</Text>
            {converted ? <Text style={typography.small}>Cobrado em {formatMoney(listing.price)}</Text> : null}
          </View>
          {isOwner ? (
            <Button
              title="Editar anúncio"
              variant="outline"
              onPress={() => router.push({ pathname: '/new-listing/details', params: { editId: String(listing.id) } })}
              style={styles.buyButton}
            />
          ) : (
            <Button title="Compra Segura" onPress={buyNow} disabled={!available} style={styles.buyButton} />
          )}
        </View>
      }
    >
      <Header
        title="Detalhe da compra"
        roundBack
        right={
          <IconButton label="Compartilhar" onPress={share}>
            <Share2 color={colors.text} size={18} />
          </IconButton>
        }
      />

      <View style={styles.imageFrame}>
        <Thumbnail uri={listing.images[0]} width="100%" height={220} rounded={radius.xl} />
      </View>

      <View style={styles.tags}>
        <Tag label={listing.game.name} />
        {listing.rarity ? <Tag label={listing.rarity} tone="pink" /> : null}
        {!available ? <Tag label={listingStatusLabels[listing.status]} tone="warning" /> : null}
      </View>

      <Text style={styles.title}>{listing.title}</Text>

      <Card style={styles.sellerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{listing.sellerName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={typography.subtitle}>{listing.sellerName}</Text>
          <Text style={styles.sellerStats}>
            {seller.data
              ? seller.data.reviewCount > 0
                ? `${seller.data.positivePercent}% positivas (${seller.data.completedSales} vendas)`
                : 'Vendedor novo'
              : ' '}
          </Text>
        </View>
        {seller.data && seller.data.reviewCount > 0 ? <Tag label="Verificado" tone="accent" filled /> : null}
      </Card>

      <Text style={[typography.section, styles.sectionTitle]}>Especificações</Text>
      <View style={styles.specs}>
        <Spec label="Categoria" value={categoryLabels[listing.category]} />
        {listing.subcategory ? <Spec label="Tipo de serviço" value={listing.subcategory} /> : null}
        <Spec label="Jogo" value={listing.game.name} />
        <Spec label="Disponível" value={`${listing.quantity} un.`} color={colors.pink} />
        <Spec label="Entrega" value="Cofre seguro peer-to-peer" color={colors.accent} />
      </View>

      <Text style={[typography.section, styles.sectionTitle]}>Descrição</Text>
      <Text style={typography.body}>{listing.description}</Text>

      <Text style={[typography.section, styles.sectionTitle]}>Ver preço em</Text>
      <View style={styles.currencies}>
        {currencies.map((c) => (
          <Chip key={c.code} label={c.label} selected={currency === c.code} onPress={() => setCurrency(c.code)} />
        ))}
      </View>
      {currency !== 'BRL' && !converted ? (
        <Text style={[typography.small, styles.warning]}>
          Cotação indisponível no momento. Exibindo o valor em reais.
        </Text>
      ) : null}

      {isOwner ? (
        <Text
          style={[typography.link, styles.ownerNote]}
          onPress={() => showMessage('Este anúncio é seu', 'Gerencie-o pela aba Vender.')}
        >
          Este anúncio é seu
        </Text>
      ) : null}
    </Screen>
  );
}

function Spec({ label, value, color = colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.specRow}>
      <Text style={typography.muted}>{label}</Text>
      <Text style={[styles.specValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  imageFrame: {
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  tags: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, flexWrap: 'wrap' },
  title: { fontFamily: fonts.displayBlack, fontSize: 28, color: colors.text, marginTop: spacing.md },
  sellerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg, padding: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.displayBlack, fontSize: 18, color: colors.accent },
  sellerStats: { fontFamily: fonts.body, fontSize: 12, color: colors.success },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  specs: { gap: spacing.sm },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  specValue: { fontFamily: fonts.bodySemiBold, fontSize: 13, flexShrink: 1, textAlign: 'right' },
  currencies: { flexDirection: 'row', gap: spacing.sm },
  warning: { color: colors.warning, marginTop: spacing.sm },
  ownerNote: { marginTop: spacing.lg, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.lg },
  totalPrice: { fontFamily: fonts.displayBlack, fontSize: 26, color: colors.text },
  buyButton: { flex: 1 },
});
