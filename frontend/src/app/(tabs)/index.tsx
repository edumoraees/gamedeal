import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Bell, Crosshair, Crown, Search, ShieldUser, Sparkles } from 'lucide-react-native';
import {
  Chip,
  EmptyView,
  ErrorView,
  IconButton,
  ListingCard,
  listingCardStyles,
  LoadingView,
  Logo,
  Screen,
  Tag,
} from '@/components';
import { useApi } from '@/hooks/useApi';
import { catalogService } from '@/services/catalogService';
import { resolveImageUrl } from '@/services/config';
import type { Listing } from '@/types/api';
import { colors, fonts, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { categoryLabels, formatMoney } from '@/utils/format';
import { showMessage } from '@/utils/dialog';

/** Atalhos de "Categorias populares" (Figma: Popular Realms). */
const realms = [
  { label: 'Skins', icon: ShieldUser, params: { category: 'SKIN' } },
  { label: 'CS2', icon: Crosshair, params: { game: 'cs2' } },
  { label: 'Valorant', icon: Sparkles, params: { game: 'valorant' } },
  { label: 'WoW', icon: Crown, params: { game: 'wow' } },
] as const;

export default function HomeScreen() {
  const { data, loading, error, refreshing, refresh, reload } = useApi(
    () => catalogService.search({ sort: 'popular', size: 7 }),
    [],
    true,
  );

  const listings = data?.content ?? [];
  // Destaque: o item mais valioso com raridade; se não houver, o primeiro da lista.
  const featured = [...listings].filter((l) => l.rarity).sort((a, b) => b.price - a.price)[0] ?? listings[0];
  const deals = listings.filter((l) => l.id !== featured?.id).slice(0, 6);

  return (
    <Screen onRefresh={refresh} refreshing={refreshing} padded={false}>
      <View style={styles.header}>
        <Logo withIcon />
        <View style={styles.headerActions}>
          <IconButton label="Buscar" onPress={() => router.push('/listings')}>
            <Search color={colors.text} size={18} />
          </IconButton>
          <IconButton label="Notificações" onPress={() => showMessage('Notificações', 'Você não tem novas notificações.')}>
            <Bell color={colors.text} size={18} />
          </IconButton>
        </View>
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <>
          {featured ? <HeroBanner listing={featured} /> : null}

          <View style={styles.section}>
            <Text style={[typography.section, styles.sectionTitle]}>Categorias populares</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.realms}>
              {realms.map(({ label, icon: Icon, params }) => (
                <Chip
                  key={label}
                  label={label}
                  icon={<Icon color={colors.accent} size={18} />}
                  onPress={() => router.push({ pathname: '/listings', params })}
                />
              ))}
            </ScrollView>
          </View>

          <View style={[styles.section, styles.padded]}>
            <View style={styles.sectionHeader}>
              <Text style={typography.section}>Ofertas em alta</Text>
              <Pressable onPress={() => router.push('/listings')} hitSlop={8}>
                <Text style={styles.viewAll}>VER TODAS</Text>
              </Pressable>
            </View>
            {deals.length === 0 ? (
              <EmptyView title="Nenhuma oferta ainda" message="Seja o primeiro a anunciar na aba Vender." />
            ) : (
              <View style={listingCardStyles.grid}>
                {deals.map((listing) => (
                  <View key={listing.id} style={listingCardStyles.cell}>
                    <ListingCard listing={listing} />
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

function HeroBanner({ listing }: { listing: Listing }) {
  const image = resolveImageUrl(listing.images[0]);
  const open = () => router.push(`/listing/${listing.id}`);

  return (
    <View style={styles.padded}>
      <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Destaque: ${listing.title}`}>
        <ImageBackground source={image ? { uri: image } : undefined} style={styles.banner} imageStyle={styles.bannerImage}>
          <LinearGradient
            colors={['rgba(11,14,20,0.93)', 'rgba(11,14,20,0.25)', 'rgba(22,26,36,0.93)']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bannerTop}>
            {listing.rarity ? <Tag label={listing.rarity} tone="pink" /> : null}
            <Text style={styles.bannerTitle} numberOfLines={1}>
              {listing.title.toUpperCase()}
            </Text>
            <Text style={typography.small}>
              {listing.game.name.toUpperCase()} • {categoryLabels[listing.category].toUpperCase()}
            </Text>
          </View>
          <View style={styles.bannerBottom}>
            <Text style={styles.bannerPrice}>{formatMoney(listing.displayPrice, listing.displayCurrency)}</Text>
            <Pressable style={styles.bannerButton} onPress={open} accessibilityRole="button">
              <Text style={styles.bannerButtonText}>VER OFERTA</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  padded: { paddingHorizontal: spacing.xxl },
  banner: {
    height: 190,
    marginVertical: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.pink,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    shadowColor: colors.pink,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  bannerImage: { borderRadius: radius.xl },
  bannerTop: { padding: spacing.lg, gap: 4 },
  bannerTitle: { fontFamily: fonts.displayBlack, fontSize: 22, color: colors.text },
  bannerBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  bannerPrice: { fontFamily: fonts.displayBlack, fontSize: 24, color: colors.pink },
  bannerButton: { backgroundColor: colors.pink, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md },
  bannerButtonText: { fontFamily: fonts.displayBlack, fontSize: 14, color: colors.text },
  section: { gap: spacing.md, paddingBottom: spacing.xl },
  sectionTitle: { paddingHorizontal: spacing.xxl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  realms: { gap: spacing.md, paddingHorizontal: spacing.xxl },
  viewAll: { fontFamily: fonts.body, fontSize: 12, color: colors.accent },
});
