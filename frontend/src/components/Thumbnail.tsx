import { useState } from 'react';
import { Image, StyleSheet, View, type ImageStyle } from 'react-native';
import { SquareDashed } from 'lucide-react-native';
import { resolveImageUrl } from '@/services/config';
import { colors, radius } from '@/theme';

type Props = {
  uri?: string | null;
  size?: number;
  width?: number | `${number}%`;
  height?: number;
  rounded?: number;
  style?: ImageStyle;
};

/**
 * Imagem do anúncio. Sem foto (ou se a URL falhar), mostra o quadrado tracejado
 * usado como placeholder no Figma.
 */
export function Thumbnail({ uri, size = 48, width, height, rounded = radius.md, style }: Props) {
  const [failed, setFailed] = useState(false);
  const source = resolveImageUrl(uri);
  const dims = { width: width ?? size, height: height ?? size, borderRadius: rounded };

  if (!source || failed) {
    return (
      <View style={[styles.placeholder, dims, style]}>
        <SquareDashed color={colors.accent} size={Math.min(28, (height ?? size) / 2.4)} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: source }}
      style={[styles.image, dims, style]}
      resizeMode="cover"
      onError={() => setFailed(true)}
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { backgroundColor: colors.background },
});
