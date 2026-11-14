import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Button, Header, Screen, TextField } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { errorMessage } from '@/services/api';
import { colors, fonts, radius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import { isValidEmail } from '@/utils/format';
import { showMessage } from '@/utils/dialog';

type Form = { username: string; email: string; password: string; confirm: string };
type Errors = Partial<Record<keyof Form | 'terms', string>>;

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState<Form>({ username: '', email: '', password: '', confirm: '' });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const update = (field: keyof Form) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  /** Mesmas regras do backend (SignupRequest), para o usuário ver o erro antes de enviar. */
  function validate(): boolean {
    const next: Errors = {};
    if (!/^[A-Za-z0-9_.]{3,40}$/.test(form.username.trim()))
      next.username = 'Use de 3 a 40 caracteres: letras, números, _ ou .';
    if (!isValidEmail(form.email)) next.email = 'Informe um e-mail válido';
    if (form.password.length < 6) next.password = 'A senha precisa ter pelo menos 6 caracteres';
    if (form.confirm !== form.password) next.confirm = 'As senhas não conferem';
    if (!acceptedTerms) next.terms = 'Aceite os termos para continuar';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSignup() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(form.username, form.email, form.password);
    } catch (err) {
      showMessage('Não foi possível criar a conta', errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Header title="Criar Conta" centered={false} />
      <View style={styles.form}>
        <TextField
          label="Nome de usuário"
          placeholder="Nome de usuário"
          autoCapitalize="none"
          value={form.username}
          onChangeText={update('username')}
          error={errors.username}
        />
        <TextField
          label="E-mail"
          placeholder="Digite seu e-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={update('email')}
          error={errors.email}
        />
        <TextField
          label="Senha"
          placeholder="Crie uma senha"
          secureTextEntry
          value={form.password}
          onChangeText={update('password')}
          error={errors.password}
        />
        <TextField
          label="Confirmar Senha"
          placeholder="Confirme sua senha"
          secureTextEntry
          value={form.confirm}
          onChangeText={update('confirm')}
          error={errors.confirm}
        />

        <Pressable
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
            {acceptedTerms ? <Check size={14} color={colors.onAccent} strokeWidth={3} /> : null}
          </View>
          <Text style={[typography.muted, styles.termsText]}>
            Li e aceito os <Text style={styles.highlight}>Termos de Uso</Text> e{' '}
            <Text style={styles.highlight}>Política de Privacidade</Text>
          </Text>
        </Pressable>
        {errors.terms ? <Text style={styles.error}>{errors.terms}</Text> : null}

        <Button title="Criar Conta" onPress={handleSignup} loading={loading} style={styles.button} />
      </View>

      <View style={styles.footer}>
        <Text style={typography.muted}>
          Já tem conta?{' '}
          <Link href="/login" style={styles.highlight}>
            Entrar
          </Link>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  termsText: { flex: 1 },
  highlight: { fontFamily: fonts.bodySemiBold, color: colors.accent, textDecorationLine: 'underline' },
  error: { fontFamily: fonts.body, fontSize: 12, color: colors.danger, marginTop: -spacing.sm },
  button: { marginTop: spacing.sm },
  footer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingVertical: spacing.xxl },
});
