import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Plus } from 'lucide-react-native';
import { ActionSheet } from '@/components/ActionSheet';
import { Button, Card, EmptyView, ErrorView, IconButton, ListingRow, LoadingView, PageTitle, Screen, Tag } from '@/components';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/services/api';
import { catalogService } from '@/services/catalogService';
import { orderService } from '@/services/orderService';
import type { Listing } from '@/types/api';
import { colors, fonts, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { confirmAction, showMessage } from '@/utils/dialog';
import { formatDate, formatMoney, listingStatusLabels, orderStatusLabels } from '@/utils/format';

/** Painel de Vendas: números do vendedor, anúncios e vendas recentes. */
export default function SellScreen() {
  const { data, loading, error, refreshing, refresh, reload } = useApi(
    async () => {
      const [listings, dashboard, sales] = await Promise.all([
        catalogService.mine(),
        orderService.dashboard(),
        orderService.mySales(),
      ]);
      return { listings, dashboard, sales };
    },
    [],
    true,
  );

  const [selected, setSelected] = useState<Listing | null>(null);

  async function changeStatus(listing: Listing) {
    const status = listing.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await catalogService.changeStatus(listing.id, status);
      await refresh();
    } catch (err) {
      showMessage('Não foi possível alterar', errorMessage(err));
    }
  }

  async function remove(listing: Listing) {
    const ok = await confirmAction('Excluir anúncio?', 'Ele deixará de aparecer para os compradores.', 'Excluir', true);
    if (!ok) return;
    try {
      await catalogService.remove(listing.id);
      await refresh();
    } catch (err) {
      showMessage('Não foi possível excluir', errorMessage(err));
    }
  }

  const activeCount = data?.listings.filter((l) => l.status === 'ACTIVE').length ?? 0;
  const totalSales = (data?.dashboard.completedSales ?? 0) + (data?.dashboard.pendingSales ?? 0);

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <PageTitle
        title="Painel de Vendas"
        right={
          <IconButton label="Notificações" onPress={() => showMessage('Notificações', 'Você não tem novas notificações.')}>
            <Bell color={colors.text} size={18} />
          </IconButton>
        }
      />

      {loading ? (
        <LoadingView />
      ) : error || !data ? (
        <ErrorView message={error ?? 'Erro ao carregar'} onRetry={reload} />
      ) : (
        <>
          <Card style={styles.stats}>
            <Stat label="Anúncios" value={String(activeCount)} />
            <View style={styles.statDivider} />
            <Stat label="Vendas" value={String(totalSales)} />
            <View style={styles.statDivider} />
            <Stat label="Faturamento" value={formatMoney(data.dashboard.revenue)} highlight />
          </Card>
          {data.dashboard.pendingBalance > 0 ? (
            <Text style={[typography.small, styles.pending]}>
              {formatMoney(data.dashboard.pendingBalance)} aguardando confirmação dos compradores
            </Text>
          ) : null}

          <Button
            title="Criar Anúncio"
            icon={<Plus color={colors.onAccent} size={18} />}
            onPress={() => router.push('/new-listing/category')}
            style={styles.create}
          />

          <Text style={[typography.section, styles.section]}>Meus anúncios</Text>
          {data.listings.length === 0 ? (
            <EmptyView title="Você ainda não anunciou" message="Toque em Criar Anúncio para começar a vender." />
          ) : (
            <View style={styles.list}>
              {data.listings.map((l) => (
                <ListingRow
                  key={l.id}
                  title={l.title}
                  subtitle={`${l.game.name} • ${l.quantity} em estoque`}
                  value={formatMoney(l.price)}
                  image={l.images[0]}
                  onPress={() => setSelected(l)}
                  badge={
                    <Tag
                      label={listingStatusLabels[l.status]}
                      tone={l.status === 'ACTIVE' ? 'accent' : l.status === 'SOLD_OUT' ? 'pink' : 'muted'}
                    />
                  }
                />
              ))}
            </View>
          )}

          <Text style={[typography.section, styles.section]}>Vendas recentes</Text>
          {data.sales.length === 0 ? (
            <EmptyView title="Nenhuma venda ainda" />
          ) : (
            <View style={styles.list}>
              {data.sales.slice(0, 5).map((o) => (
                <ListingRow
                  key={o.id}
                  title={o.listingTitle}
                  subtitle={`${o.buyerName} • ${formatDate(o.createdAt)} • ${o.quantity} un.`}
                  value={formatMoney(o.sellerNet)}
                  valueColor={colors.success}
                  image={o.listingImage}
                  badge={
                    <Tag
                      label={o.status === 'COMPLETED' ? 'Vendido' : orderStatusLabels[o.status]}
                      tone={o.status === 'COMPLETED' ? 'success' : 'warning'}
                    />
                  }
                />
              ))}
            </View>
          )}
        </>
      )}

      <ActionSheet
        visible={!!selected}
        title={selected?.title}
        subtitle={selected ? `Status: ${listingStatusLabels[selected.status]}` : undefined}
        onClose={() => setSelected(null)}
        options={
          selected
            ? [
                { label: 'Ver anúncio', onPress: () => router.push(`/listing/${selected.id}`) },
                {
                  label: 'Editar',
                  onPress: () =>
                    router.push({ pathname: '/new-listing/details', params: { editId: String(selected.id) } }),
                },
                ...(selected.status === 'SOLD_OUT'
                  ? []
                  : [{ label: selected.status === 'ACTIVE' ? 'Pausar' : 'Reativar', onPress: () => changeStatus(selected) }]),
                { label: 'Excluir', destructive: true, onPress: () => remove(selected) },
              ]
            : []
        }
      />
    </Screen>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={typography.small}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: colors.accent }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: fonts.displayBlack, fontSize: 16, color: colors.text },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  pending: { marginTop: spacing.sm, textAlign: 'center', color: colors.warning },
  create: { marginTop: spacing.lg },
  section: { marginTop: spacing.xxl, marginBottom: spacing.md, textTransform: 'none' },
  list: { gap: spacing.md },
});
