import { Tabs } from 'expo-router/js-tabs';
import { House, ShoppingBag, ShoppingCart, User, Zap } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { colors, fonts } from '@/theme';

/** Barra inferior do Figma: Início, Serviços, Vender, Perfil e Carrinho. */
export default function TabsLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.displayBold, fontSize: 12 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ color }) => <House color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="services"
        options={{ title: 'Serviços', tabBarIcon: ({ color }) => <Zap color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="sell"
        options={{ title: 'Vender', tabBarIcon: ({ color }) => <ShoppingBag color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <User color={color} size={24} /> }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.pink, color: colors.text, fontSize: 11 },
        }}
      />
    </Tabs>
  );
}
