import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Chip, ErrorView, Header, LoadingView, Screen, StarRating, Tag, TextField } from '@/components';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/services/api';
import { orderService } from '@/services/orderService';
import { colors, fonts, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { showMessage } from '@/utils/dialog';

const experienceTags = ['Entrega Rápida', 'Boa Comunicação', 'Item Conforme', 'Confiável', 'Recomendo'];

/** Tela "Avaliar Vendedor". */
export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const { data, loading, error, reload } = useApi(async () => {
    const order = await orderService.findById(Number(orderId));
    const summary = await orderService.sellerSummary(order.sellerId);
    return { order, summary };
  }, [orderId]);

  const toggleTag = (tag: string) =>
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));

  async function send() {
    if (rating === 0) {
      showMessage('Escolha uma nota', 'Toque nas estrelas para avaliar o vendedor.');
      return;
    }
    setSending(true);
    try {
      await orderService.review(Number(orderId), { rating, comment: comment.trim() || undefined, tags });
      showMessage('Avaliação enviada!', 'Obrigado por ajudar a comunidade GameDeal.');
      router.back();
    } catch (err) {
      showMessage('Não foi possível enviar', errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Screen scroll={false}><LoadingView /></Screen>;
  if (error || !data) {
    return (
      <Screen scroll={false}>
        <Header title="Avaliar Vendedor" />
        <ErrorView message={error ?? 'Pedido não encontrado'} onRetry={reload} />
      </Screen>
    );
  }

  const { order, summary } = data;
  const isPro = summary.reviewCount > 0 && summary.averageRating >= 4.5;

  return (
    <Screen footer={<Button title="Enviar Avaliação" onPress={send} loading={sending} />}>
      <Header title="Avaliar Vendedor" />

      <View style={styles.seller}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{order.sellerName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={typography.subtitle}>{order.sellerName}</Text>
          <Text style={typography.small}>
            <Text style={styles.bold}>Nota {summary.reviewCount > 0 ? summary.averageRating.toFixed(1) : '—'}</Text> (
            {summary.reviewCount} avaliações)
          </Text>
        </View>
        {isPro ? <Tag label="Vendedor Pro" filled /> : null}
      </View>
      <Text style={[typography.small, styles.item]} numberOfLines={1}>
        Pedido #{order.id} • {order.listingTitle}
      </Text>

      <View style={styles.divider} />

      <Text style={[typography.subtitle, styles.center]}>Sua Avaliação</Text>
      <View style={styles.stars}>
        <StarRating value={rating} onChange={setRating} />
      </View>

      <Text style={[typography.subtitle, styles.label]}>Escreva seu comentário</Text>
      <TextField
        multiline
        placeholder="Conte sua experiência com este vendedor..."
        value={comment}
        onChangeText={setComment}
        maxLength={1000}
        style={styles.comment}
      />

      <Text style={[typography.subtitle, styles.label]}>Como foi a experiência?</Text>
      <View style={styles.tags}>
        {experienceTags.map((tag) => (
          <Chip key={tag} label={tag} shape="pill" selected={tags.includes(tag)} onPress={() => toggleTag(tag)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  seller: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.displayBlack, fontSize: 20, color: colors.accent },
  bold: { fontFamily: fonts.bodySemiBold, color: colors.text },
  item: { marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xl },
  center: { textAlign: 'center' },
  stars: { marginTop: spacing.md, marginBottom: spacing.xl },
  label: { marginBottom: spacing.sm, marginTop: spacing.md },
  comment: { height: 120 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
