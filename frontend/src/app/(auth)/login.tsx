import { useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Button, Logo, Screen, TextField } from '@/components';
import type { TextFieldRef } from '@/components/TextField';
import { useAuth } from '@/contexts/AuthContext';
import { errorMessage } from '@/services/api';
import { colors, fonts, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { isValidEmail } from '@/utils/format';
import { showMessage } from '@/utils/dialog';

type Errors = { email?: string; password?: string };

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextFieldRef>(null);

  function validate(): boolean {
    const next: Errors = {};
    if (!isValidEmail(email)) next.email = 'Informe um e-mail válido';
    if (!password) next.password = 'Informe sua senha';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
      // O Stack.Protected redireciona para as abas automaticamente.
    } catch (err) {
      showMessage('Não foi possível entrar', errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const socialUnavailable = () =>
    showMessage('Em breve', 'O login com redes sociais ainda não está disponível. Use e-mail e senha.');

  return (
    <Screen edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.brand}>
        <Image source={require('../../../assets/logo.png')} style={styles.logoBox} accessibilityIgnoresInvertColors />
        <Logo size={30} />
        <Text style={[typography.muted, styles.center]}>O mercado seguro para seus itens virtuais</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="E-mail"
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="next"
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={errors.email}
        />
        <TextField
          ref={passwordRef}
          label="Senha"
          placeholder="Digite sua senha"
          secureTextEntry
          autoComplete="password"
          returnKeyType="go"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
          error={errors.password}
        />
        <Text
          style={[typography.link, styles.forgot]}
          onPress={() => showMessage('Recuperar senha', 'Procure o suporte do GameDeal para redefinir sua senha.')}
        >
          Esqueceu a senha?
        </Text>

        <Button title="Entrar" onPress={handleLogin} loading={loading} style={styles.mainButton} />

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={typography.small}>ou</Text>
          <View style={styles.divider} />
        </View>

        <Button title="Entrar com Google" variant="secondary" onPress={socialUnavailable} />
        <Button title="Entrar com Apple" variant="secondary" onPress={socialUnavailable} />
      </View>

      <View style={styles.footer}>
        <Text style={typography.muted}>
          Não tem conta?{' '}
          <Link href="/signup" style={styles.footerLink}>
            Cadastre-se
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between' },
  brand: { alignItems: 'center', gap: spacing.md, marginTop: 48, marginBottom: 32 },
  logoBox: { width: 64, height: 64, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  center: { textAlign: 'center' },
  form: { gap: spacing.lg },
  forgot: { alignSelf: 'flex-end', marginTop: -spacing.sm },
  mainButton: { marginTop: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  footer: { alignItems: 'center', paddingVertical: spacing.xxl },
  footerLink: { fontFamily: fonts.bodySemiBold, color: colors.accent, textDecorationLine: 'underline' },
});
