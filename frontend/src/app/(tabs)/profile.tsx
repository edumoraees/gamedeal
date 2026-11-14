import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LogOut, Package } from 'lucide-react-native';
import {
  Button,
  Card,
  EmptyView,
  ErrorView,
  ListingCard,
  listingCardStyles,
  LoadingView,
  Screen,
  Tag,
} from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { catalogService } from '@/services/catalogService';
import { orderService } from '@/services/orderService';
import { colors, fonts, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { confirmAction } from '@/utils/dialog';
import { formatDate, formatMoney, memberSinceYear, orderStatusLabels } from '@/utils/format';

type LedgerEntry = { key: string; title: string; date: string; status: string; amount: number; incoming: boolean };

/** Perfil: reputação, anúncios ativos e movimentações recentes (compras e vendas). */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const { data, loading, error, refreshing, refresh, reload } = useApi(
    async () => {
      if (!user) throw new Error('Sessão expirada');
      const [summary, dashboard, listings, purchases, sales] = await Promise.all([
        orderService.sellerSummary(user.id),
        orderService.dashboard(),
        catalogService.mine(),
        orderService.myPurchases(),
        orderService.mySales(),
      ]);
      const ledger: LedgerEntry[] = [
        ...sales.map((o) => ({
          key: `s${o.id}`,
          title: o.listingTitle,
          date: o.createdAt,
          status: orderStatusLabels[o.status],
          amount: o.sellerNet,
          incoming: true,
        })),
        ...purchases.map((o) => ({
          key: `p${o.id}`,
          title: o.listingTitle,
          date: o.createdAt,
          status: orderStatusLabels[o.status],
          amount: o.total,
          incoming: false,
        })),
      ]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6);
      return { summary, dashboard, listings: listings.filter((l) => l.status === 'ACTIVE').slice(0, 4), ledger };
    },
    [user?.id],
    true,
  );

  async function handleLogout() {
    if (await confirmAction('Sair da conta?', 'Você precisará entrar novamente.', 'Sair', true)) await signOut();
  }

  if (!user) return null;
  const totalDeals = (data?.dashboard.completedSales ?? 0) + (data?.dashboard.completedPurchases ?? 0);
  const isPro = (data?.summary.reviewCount ?? 0) > 0 && (data?.summary.averageRating ?? 0) >= 4.5;

  return (
    <Screen onRefresh={refresh} refreshing={refreshing} padded={false}>
      <View style={styles.hero}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.flex}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {user.username}
              </Text>
              {isPro ? <Tag label="PRO" tone="pink" filled /> : null}
            </View>
            <Text style={typography.muted}>
              Membro desde {memberSinceYear(user.createdAt)} • {user.email}
            </Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Text style={typography.small}>REPUTAÇÃO POSITIVA</Text>
            <Text style={styles.statValue}>
              {data && data.summary.reviewCount > 0 ? `${data.summary.positivePercent}%` : '—'}
            </Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={typography.small}>TOTAL DE NEGÓCIOS</Text>
            <Text style={styles.statValue}>{totalDeals}</Text>
          </Card>
        </View>
      </View>

      <View style={styles.body}>
        {loading ? (
          <LoadingView />
        ) : error || !data ? (
          <ErrorView message={error ?? 'Erro ao carregar'} onRetry={reload} />
        ) : (
          <>
            <Text style={[typography.section, styles.section]}>Meus anúncios ativos</Text>
            {data.listings.length === 0 ? (
              <EmptyView title="Nenhum anúncio ativo" />
            ) : (
              <View style={listingCardStyles.grid}>
                {data.listings.map((l) => (
                  <View key={l.id} style={listingCardStyles.cell}>
                    <ListingCard listing={l} />
                  </View>
                ))}
              </View>
            )}

            <Text style={[typography.section, styles.section]}>Últimas movimentações</Text>
            {data.ledger.length === 0 ? (
              <EmptyView title="Nenhuma movimentação ainda" />
            ) : (
              <View style={styles.ledger}>
                {data.ledger.map((entry) => (
                  <Card key={entry.key} style={styles.ledgerRow}>
                    <View style={styles.flex}>
                      <Text style={typography.subtitle} numberOfLines={1}>
                        {entry.title}
                      </Text>
                      <Text style={typography.small}>
                        {formatDate(entry.date)} • {entry.incoming ? 'VENDA' : 'COMPRA'} • {entry.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.amount, { color: entry.incoming ? colors.success : colors.pink }]}>
                      {entry.incoming ? '+' : '-'}
                      {formatMoney(entry.amount)}
                    </Text>
                  </Card>
                ))}
              </View>
            )}

            <View style={styles.actions}>
              <Button
                title="Minhas compras"
                variant="outline"
                icon={<Package color={colors.accent} size={18} />}
                onPress={() => router.push('/orders')}
              />
              <Button
                title="Sair"
                variant="danger"
                icon={<LogOut color={colors.danger} size={18} />}
                onPress={handleLogout}
              />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    gap: spacing.xl,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.displayBlack, fontSize: 28, color: colors.accent },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.text, flexShrink: 1 },
  stats: { flexDirection: 'row', gap: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.background, gap: 4 },
  statValue: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.success },
  body: { paddingHorizontal: spacing.xxl },
  section: { marginTop: spacing.xxl, marginBottom: spacing.md },
  ledger: { gap: spacing.md },
  ledgerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  amount: { fontFamily: fonts.displayBlack, fontSize: 16 },
  actions: { gap: spacing.md, marginTop: spacing.xxl },
});
