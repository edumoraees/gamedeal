import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Listing } from '@/types/api';
import { colors, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { formatMoney } from '@/utils/format';
import { Card } from './Card';
import { Tag } from './Tag';
import { Thumbnail } from './Thumbnail';

/** Card de oferta em grade ("Trending Hot Deals" / "Active Vault Listings"). */
export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Card
      style={styles.card}
      onPress={() => router.push(`/listing/${listing.id}`)}
      accessibilityLabel={`${listing.title}, ${formatMoney(listing.displayPrice, listing.displayCurrency)}`}
    >
      <Thumbnail uri={listing.images[0]} width="100%" height={110} />
      <View style={styles.info}>
        <Tag label={listing.game.slug.toUpperCase()} />
        <Text style={typography.subtitle} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={typography.price}>{formatMoney(listing.displayPrice, listing.displayCurrency)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: spacing.md, gap: 10 },
  info: { gap: 4 },
});

export const listingCardStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.lg },
  cell: { width: '47.5%' },
  separator: { height: 1, backgroundColor: colors.border },
});
