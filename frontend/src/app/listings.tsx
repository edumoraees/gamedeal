import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Chip, EmptyView, ErrorView, Header, ListingCard, LoadingView, Screen, TextField } from '@/components';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/services/api';
import { catalogService } from '@/services/catalogService';
import type { Listing, ListingCategory } from '@/types/api';
import { colors, spacing } from '@/theme';
import { categoryLabels } from '@/utils/format';

const PAGE_SIZE = 10;
const categories = Object.keys(categoryLabels) as ListingCategory[];

/** Explorar anúncios: busca por nome, filtros de categoria e jogo, paginação infinita. */
export default function ListingsScreen() {
  const params = useLocalSearchParams<{ category?: string; game?: string; search?: string }>();
  const games = useApi(() => catalogService.games(), []);

  const [search, setSearch] = useState(params.search ?? '');
  const [debounced, setDebounced] = useState(search);
  const [category, setCategory] = useState<ListingCategory | undefined>(
    categories.includes(params.category as ListingCategory) ? (params.category as ListingCategory) : undefined,
  );
  const [gameSlug, setGameSlug] = useState<string | undefined>(params.game);

  const [items, setItems] = useState<Listing[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Espera o usuário parar de digitar antes de buscar.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const gameId = useMemo(() => games.data?.find((g) => g.slug === gameSlug)?.id, [games.data, gameSlug]);
  const waitingGames = !!gameSlug && !games.data && !games.error;

  const load = useCallback(
    async (pageToLoad: number) => {
      if (pageToLoad === 0) setLoading(true);
      else setLoadingMore(true);
      try {
        const result = await catalogService.search({
          category,
          gameId,
          search: debounced || undefined,
          page: pageToLoad,
          size: PAGE_SIZE,
        });
        setItems((current) => (pageToLoad === 0 ? result.content : [...current, ...result.content]));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setError(null);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, gameId, debounced],
  );

  useEffect(() => {
    if (!waitingGames) void load(0);
  }, [load, waitingGames]);

  const loadMore = () => {
    if (!loadingMore && !loading && page + 1 < totalPages) void load(page + 1);
  };

  return (
    <Screen scroll={false}>
      <Header title="Explorar" />
      <TextField placeholder="Buscar por nome do item..." value={search} onChangeText={setSearch} returnKeyType="search" />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipRow}>
        <Chip label="Todos" selected={!category} onPress={() => setCategory(undefined)} />
        {categories.map((c) => (
          <Chip key={c} label={categoryLabels[c]} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipRow}>
        <Chip label="Todos os jogos" selected={!gameSlug} onPress={() => setGameSlug(undefined)} />
        {(games.data ?? []).map((g) => (
          <Chip key={g.id} label={g.name} selected={gameSlug === g.slug} onPress={() => setGameSlug(g.slug)} />
        ))}
      </ScrollView>

      {loading ? (
        <LoadingView />
      ) : error && items.length === 0 ? (
        <ErrorView message={error} onRetry={() => load(0)} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <ListingCard listing={item} />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<EmptyView title="Nada encontrado" message="Tente outro filtro ou termo de busca." />}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.accent} style={styles.more} /> : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexGrow: 0, marginTop: spacing.md },
  chips: { gap: spacing.sm },
  list: { paddingVertical: spacing.lg, gap: spacing.lg },
  column: { gap: spacing.lg },
  cell: { flex: 1, maxWidth: '50%' },
  more: { marginVertical: spacing.lg },
});
