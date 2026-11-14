import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { Card } from './Card';
import { Thumbnail } from './Thumbnail';

type Props = {
  title: string;
  subtitle?: string;
  value: string;
  valueColor?: string;
  image?: string | null;
  badge?: ReactNode;
  onPress?: () => void;
};

/** Linha com miniatura, título, valor e etiqueta (Painel de Vendas, pedidos). */
export function ListingRow({ title, subtitle, value, valueColor = colors.accent, image, badge, onPress }: Props) {
  return (
    <Card style={styles.card} onPress={onPress} accessibilityLabel={`${title}, ${value}`}>
      <Thumbnail uri={image} size={50} />
      <View style={styles.info}>
        <Text style={typography.subtitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={typography.small} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      </View>
      {badge}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  info: { flex: 1, gap: 2 },
  value: { ...typography.label },
});
