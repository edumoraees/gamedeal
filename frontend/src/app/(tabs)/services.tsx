import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SlidersHorizontal, Star } from 'lucide-react-native';
import { Button, Card, Chip, EmptyView, ErrorView, IconButton, LoadingView, PageTitle, Screen, Tag } from '@/components';
import { useApi } from '@/hooks/useApi';
import { catalogService } from '@/services/catalogService';
import { orderService } from '@/services/orderService';
import type { Listing, SellerSummary } from '@/types/api';
import { colors, fonts, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { formatMoney } from '@/utils/format';

/** Filtros da tela "Serviços Gaming" (subcategorias dos anúncios do tipo SERVICO). */
const filters = ['Todos os serviços', 'Upar', 'Coaching', 'Dungeons', 'Rank Boost'];

export default function ServicesScreen() {
  const [filter, setFilter] = useState(filters[0]);
  const [sortByPrice, setSortByPrice] = useState(false);
  const subcategory = filter === filters[0] ? undefined : filter;

  const { data, loading, error, refreshing, refresh, reload } = useApi(
    async () => {
      const page = await catalogService.search({
        category: 'SERVICO',
        subcategory,
        sort: sortByPrice ? 'price_asc' : 'popular',
        size: 30,
      });
      // Reputação dos vendedores (order-service), uma consulta por vendedor.
      const sellerIds = [...new Set(page.content.map((l) => l.sellerId))];
      const summaries = await Promise.all(
        sellerIds.map((id) => orderService.sellerSummary(id).catch(() => undefined)),
      );
      const bySeller = new Map<number, SellerSummary>();
      summaries.forEach((s) => s && bySeller.set(s.sellerId, s));
      return { listings: page.content, bySeller };
    },
    [subcategory, sortByPrice],
    true,
  );

  return (
    <Screen scroll={false}>
      <PageTitle
        title="Serviços Gaming"
        right={
          <IconButton label="Ordenar por preço" onPress={() => setSortByPrice((v) => !v)}>
            <SlidersHorizontal color={sortByPrice ? colors.accent : colors.text} size={18} />
          </IconButton>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filters}>
        {filters.map((f) => (
          <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data?.listings ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ServiceCard listing={item} summary={data?.bySeller.get(item.sellerId)} />}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={refresh}
          ListEmptyComponent={
            <EmptyView title="Nenhum serviço encontrado" message="Ofereça mentorias e boosts pela aba Vender." />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

function ServiceCard({ listing, summary }: { listing: Listing; summary?: SellerSummary }) {
  const rating = summary && summary.reviewCount > 0 ? summary.averageRating.toFixed(1) : 'Novo';
  return (
    <Card style={styles.card} onPress={() => router.push(`/listing/${listing.id}`)}>
      <View style={styles.cardTop}>
        <View style={styles.sellerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{listing.sellerName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={typography.subtitle}>{listing.sellerName}</Text>
        </View>
        <View style={styles.rating}>
          <Star size={16} color={colors.warning} />
          <Text style={typography.label}>{rating}</Text>
        </View>
      </View>

      <Text style={typography.subtitle} numberOfLines={2}>
        {listing.title}
      </Text>
      <View style={styles.tags}>
        <Tag label={listing.game.slug} />
        {listing.subcategory ? <Tag label={listing.subcategory} tone="muted" /> : null}
      </View>

      <View style={styles.divider} />
      <View style={styles.cardBottom}>
        <View>
          <Text style={typography.small}>A partir de</Text>
          <Text style={styles.price}>{formatMoney(listing.price)}</Text>
        </View>
        <Button title="Contratar" size="sm" onPress={() => router.push(`/listing/${listing.id}`)} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexGrow: 0 },
  filters: { gap: spacing.sm },
  list: { paddingVertical: spacing.xl, gap: spacing.md },
  card: { gap: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.displayBlack, fontSize: 13, color: colors.onAccent },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tags: { flexDirection: 'row', gap: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontFamily: fonts.displayBlack, fontSize: 18, color: colors.accent },
});
