import { Pressable, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/theme';

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  color?: string;
};

/** Estrelas de 1 a 5. Com onChange vira seletor (tela Avaliar Vendedor). */
export function StarRating({ value, onChange, size = 32, color = colors.accent }: Props) {
  return (
    <View style={styles.row} accessibilityRole={onChange ? 'adjustable' : 'text'} accessibilityLabel={`Nota ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = <Star size={size} color={color} fill={filled ? color : 'transparent'} strokeWidth={1.8} />;
        return onChange ? (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6} accessibilityLabel={`${n} estrela${n > 1 ? 's' : ''}`}>
            {star}
          </Pressable>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
});
