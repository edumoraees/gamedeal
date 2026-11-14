import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ChevronDown, ImagePlus, SquareDashed, X } from 'lucide-react-native';
import { Button, Chip, ErrorView, Header, LoadingView, Screen, TextField, Thumbnail } from '@/components';
import { useNewListing } from '@/contexts/NewListingContext';
import { useApi } from '@/hooks/useApi';
import { errorMessage } from '@/services/api';
import { catalogService } from '@/services/catalogService';
import { colors, fonts, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { showMessage } from '@/utils/dialog';
import { categoryLabels, parseMoneyInput } from '@/utils/format';

const MAX_PHOTOS = 3;
const serviceTypes = ['Upar', 'Coaching', 'Dungeons', 'Rank Boost'];
const rarities = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

type Errors = Partial<Record<'title' | 'game' | 'description' | 'price' | 'quantity' | 'subcategory', string>>;

/** Etapa 2 do anúncio: "Detalhes do Item" (também usada para editar um anúncio existente). */
export default function DetailsScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { draft, update, reset } = useNewListing();
  const games = useApi(() => catalogService.games(), []);
  const [errors, setErrors] = useState<Errors>({});
  const [gamePickerOpen, setGamePickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [editError, setEditError] = useState<string | null>(null);

  // Modo edição: carrega o anúncio e preenche o rascunho.
  useEffect(() => {
    if (!editId) return;
    catalogService
      .findById(Number(editId))
      .then((l) =>
        reset({
          editId: l.id,
          category: l.category,
          title: l.title,
          description: l.description,
          game: l.game,
          priceText: String(l.price).replace('.', ','),
          quantityText: String(l.quantity),
          subcategory: l.subcategory ?? undefined,
          rarity: l.rarity ?? undefined,
          images: l.images,
        }),
      )
      .catch((err) => setEditError(errorMessage(err)))
      .finally(() => setLoadingEdit(false));
  }, [editId, reset]);

  async function addPhoto() {
    if (draft.images.length >= MAX_PHOTOS) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showMessage('Permissão necessária', 'Autorize o acesso às fotos para adicionar imagens ao anúncio.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const url = await catalogService.uploadImage(asset.uri, asset.mimeType ?? 'image/jpeg');
      update({ images: [...draft.images, url] });
    } catch (err) {
      showMessage('Falha no envio da foto', errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    update({ images: draft.images.filter((_, i) => i !== index) });
  }

  /** Mesmas regras do backend (ListingRequest). */
  function validate(): boolean {
    const next: Errors = {};
    const price = parseMoneyInput(draft.priceText);
    const quantity = Number(draft.quantityText);
    if (!draft.title.trim()) next.title = 'Informe o nome do item';
    else if (draft.title.trim().length > 120) next.title = 'Máximo de 120 caracteres';
    if (!draft.game) next.game = 'Selecione o jogo';
    if (draft.description.trim().length < 10) next.description = 'Descreva o item com pelo menos 10 caracteres';
    if (!(price > 0)) next.price = 'Informe um preço maior que zero';
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) next.quantity = 'Entre 1 e 9999';
    if (draft.category === 'SERVICO' && !draft.subcategory) next.subcategory = 'Escolha o tipo de serviço';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function next() {
    if (validate()) router.push('/new-listing/review');
  }

  if (loadingEdit) return <Screen scroll={false}><LoadingView /></Screen>;
  if (editError) {
    return (
      <Screen scroll={false}>
        <Header title="Editar Anúncio" />
        <ErrorView message={editError} />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title="Avançar" onPress={next} disabled={uploading} />}>
      <Header title={draft.editId ? 'Editar Anúncio' : 'Detalhes do Item'} />
      {draft.category ? <Text style={[typography.small, styles.category]}>{categoryLabels[draft.category]}</Text> : null}

      <View style={styles.form}>
        <TextField
          label="Nome do Item"
          required
          placeholder="Ex: Espada Lendária do Dragão"
          value={draft.title}
          onChangeText={(title) => update({ title })}
          maxLength={120}
          error={errors.title}
        />

        <View style={styles.field}>
          <Text style={typography.label}>Jogo *</Text>
          <Pressable
            style={[styles.select, errors.game ? styles.selectError : null]}
            onPress={() => setGamePickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Selecionar jogo"
          >
            <Text style={[typography.body, !draft.game && { color: colors.textMuted }]}>
              {draft.game?.name ?? 'Selecione o jogo'}
            </Text>
            <ChevronDown color={colors.textMuted} size={18} />
          </Pressable>
          {errors.game ? <Text style={styles.error}>{errors.game}</Text> : null}
        </View>

        {draft.category === 'SERVICO' ? (
          <View style={styles.field}>
            <Text style={typography.label}>Tipo de serviço *</Text>
            <View style={styles.chips}>
              {serviceTypes.map((t) => (
                <Chip key={t} label={t} selected={draft.subcategory === t} onPress={() => update({ subcategory: t })} />
              ))}
            </View>
            {errors.subcategory ? <Text style={styles.error}>{errors.subcategory}</Text> : null}
          </View>
        ) : null}

        {draft.category === 'SKIN' || draft.category === 'ARMA' ? (
          <View style={styles.field}>
            <Text style={typography.label}>Raridade</Text>
            <View style={styles.chips}>
              {rarities.map((r) => (
                <Chip
                  key={r}
                  label={r}
                  selected={draft.rarity === r}
                  onPress={() => update({ rarity: draft.rarity === r ? undefined : r })}
                />
              ))}
            </View>
          </View>
        ) : null}

        <TextField
          label="Descrição"
          required
          multiline
          placeholder="Descreva o estado, nível ou detalhes específicos do item"
          value={draft.description}
          onChangeText={(description) => update({ description })}
          maxLength={2000}
          error={errors.description}
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField
              label="Preço (R$)"
              required
              placeholder="0,00"
              keyboardType="decimal-pad"
              value={draft.priceText}
              onChangeText={(priceText) => update({ priceText })}
              error={errors.price}
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label="Quantidade"
              required
              placeholder="1"
              keyboardType="number-pad"
              value={draft.quantityText}
              onChangeText={(quantityText) => update({ quantityText: quantityText.replace(/\D/g, '') })}
              error={errors.quantity}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={typography.label}>Adicionar Fotos</Text>
          <View style={styles.photos}>
            {draft.images.map((url, index) => (
              <View key={url} style={styles.photoSlot}>
                <Thumbnail uri={url} size={64} />
                <Pressable
                  style={styles.removePhoto}
                  onPress={() => removePhoto(index)}
                  accessibilityLabel="Remover foto"
                  hitSlop={6}
                >
                  <X color={colors.text} size={12} />
                </Pressable>
              </View>
            ))}
            {draft.images.length < MAX_PHOTOS ? (
              <Pressable style={[styles.photoSlot, styles.addPhoto]} onPress={addPhoto} accessibilityLabel="Adicionar foto">
                {uploading ? <ActivityIndicator color={colors.accent} /> : <ImagePlus color={colors.accent} size={22} />}
              </Pressable>
            ) : null}
            {Array.from({ length: Math.max(0, MAX_PHOTOS - draft.images.length - 1) }).map((_, i) => (
              <View key={`empty-${i}`} style={[styles.photoSlot, styles.emptySlot]}>
                <SquareDashed color={colors.textMuted} size={16} />
              </View>
            ))}
          </View>
        </View>
      </View>

      <Modal visible={gamePickerOpen} transparent animationType="fade" onRequestClose={() => setGamePickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setGamePickerOpen(false)}>
          <View style={styles.picker}>
            <Text style={typography.subtitle}>Selecione o jogo</Text>
            {games.loading ? (
              <ActivityIndicator color={colors.accent} />
            ) : games.error ? (
              <Text style={styles.error}>{games.error}</Text>
            ) : (
              <ScrollView style={styles.pickerList}>
                {(games.data ?? []).map((g) => (
                  <Pressable
                    key={g.id}
                    style={[styles.pickerItem, draft.game?.id === g.id && styles.pickerItemSelected]}
                    onPress={() => {
                      update({ game: g });
                      setGamePickerOpen(false);
                    }}
                  >
                    <Text style={typography.body}>{g.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  category: { marginTop: -spacing.sm, marginBottom: spacing.sm, color: colors.accent },
  form: { gap: spacing.lg },
  field: { gap: spacing.sm },
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  select: {
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectError: { borderColor: colors.danger },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.danger },
  photos: { flexDirection: 'row', gap: spacing.sm },
  photoSlot: { width: 64, height: 64, borderRadius: radius.md },
  addPhoto: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.xxl },
  picker: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '70%',
  },
  pickerList: { flexGrow: 0 },
  pickerItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  pickerItemSelected: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.accent },
});
