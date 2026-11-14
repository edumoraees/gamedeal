import { FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button, EmptyView, ErrorView, Header, ListingRow, LoadingView, Screen, Tag } from '@/components';
import { useApi } from '@/hooks/useApi';
import { orderService } from '@/services/orderService';
import { colors, spacing } from '@/theme';
import { formatDate, formatMoney, orderStatusLabels } from '@/utils/format';

/** Minhas compras. */
export default function OrdersScreen() {
  const { data, loading, error, refreshing, refresh, reload } = useApi(() => orderService.myPurchases(), [], true);

  return (
    <Screen scroll={false}>
      <Header title="Minhas compras" />
      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(o) => String(o.id)}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={refresh}
          renderItem={({ item: o }) => (
            <ListingRow
              title={o.listingTitle}
              subtitle={`${o.sellerName} • ${formatDate(o.createdAt)} • ${o.quantity} un.`}
              value={formatMoney(o.total)}
              valueColor={colors.pink}
              image={o.listingImage}
              onPress={() => router.push(`/order/${o.id}`)}
              badge={
                <Tag
                  label={o.status === 'COMPLETED' && !o.reviewed ? 'Avaliar' : orderStatusLabels[o.status]}
                  tone={o.status === 'PAID' ? 'warning' : o.reviewed ? 'success' : 'accent'}
                />
              }
            />
          )}
          ListEmptyComponent={
            <EmptyView
              title="Você ainda não comprou nada"
              action={<Button title="Explorar ofertas" size="sm" variant="outline" onPress={() => router.push('/listings')} />}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md, paddingBottom: spacing.xxl },
});
