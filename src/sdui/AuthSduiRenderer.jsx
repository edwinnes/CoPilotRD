import { useAppTheme } from '../context/ThemeContext';
import { getChromePalette } from '../theme/chromePalette';
import React from 'react';
import ChromeButton from '../components/ChromeButton';
import ChromeSurface from '../components/ChromeSurface';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const ALLOWED_ACTIONS = new Set([
  'login',
  'forgot_password',
  'navigate_register',
]);

const ALLOWED_PROVIDERS = new Set([
  'google',
  'apple',
]);

export default function AuthSduiRenderer({
  schema,
  values = {},
  onChangeField,
  onAction,
  onSocialAuth,
  submitting = false,
}) {
  const { theme } = useAppTheme();
  const palette = getChromePalette(theme);

  const dynamic = {
    container: { backgroundColor: 'transparent' },
    title: { color: palette.text },
    subtitle: { color: palette.muted },
    input: {
      backgroundColor: palette.input,
      borderColor: palette.inputBorder,
      color: palette.text,
    },
    button: {
      backgroundColor: palette.silver,
      borderColor: palette.silverHighlight,
    },
    buttonText: { color: palette.buttonText },
    link: { color: palette.text },
    dividerText: { color: palette.muted },
    socialButton: {
      backgroundColor: palette.surface,
      borderColor: palette.inputBorder,
    },
    socialText: { color: palette.text },
    footer: { color: palette.muted },
    footerAction: { color: palette.text },
  };

  if (!schema || !Array.isArray(schema.components)) {
    return null;
  }

  const renderComponent = (component, index) => {
    const key = `${component.type}-${index}`;

    switch (component.type) {
      case 'header':
        return (
          <View key={key} style={styles.header}>
            {!/^\s*CoPilot\s*RD\s*®?\s*$/i.test(
              String(component.title || '')
            ) && (
              <Text style={[styles.title, dynamic.title]}>
                {component.title}
              </Text>
            )}
            {component.subtitle ? (
              <Text style={[styles.subtitle, dynamic.subtitle]}>
                {component.subtitle}
              </Text>
            ) : null}
          </View>
        );

      case 'input':
        return (
          <ChromeSurface
            key={key}
            variant="input"
            radius={15}
            style={{ height: 62, marginBottom: 17 }}
          >
            <TextInput
              style={[
                styles.input,
                dynamic.input,
                {
                  minHeight: 0,
                  height: '100%',
                  marginBottom: 0,
                  borderWidth: 0,
                  backgroundColor: 'transparent',
                },
              ]}
              placeholder={
                component.key === 'identifier'
                  ? 'Correo electrónico'
                  : (component.placeholder || '')
              }
              placeholderTextColor={palette.muted}
              value={values[component.key] || ''}
              onChangeText={(text) =>
                onChangeField?.(component.key, text)
              }
              secureTextEntry={
                component.secure === true ||
                component.key === 'password'
              }
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={component.key === "identifier" ? "email-address" : "default"}
              editable={!submitting}
            />
          </ChromeSurface>
        );

      case 'button': {
        const allowed = ALLOWED_ACTIONS.has(component.action);

        return (
          <ChromeButton
            key={key}
            title={component.label}
            height={60}
            style={{
              marginTop: 18,
              marginBottom: 16,
            }}
            disabled={!allowed || submitting}
            loading={allowed && submitting}
            onPress={() => {
              if (allowed && !submitting) {
                onAction?.(component.action);
              }
            }}
          />
        );
      }

      case 'link': {
        const allowed = ALLOWED_ACTIONS.has(component.action);

        return (
          <TouchableOpacity
            key={key}
            disabled={!allowed || submitting}
            onPress={() => onAction?.(component.action)}
          >
            <Text style={[styles.link, dynamic.link]}>
              {component.label}
            </Text>
          </TouchableOpacity>
        );
      }

      case 'divider':
        return (
          <View key={key} style={styles.divider}>
            <Text style={[styles.dividerText, dynamic.dividerText]}>
              {component.text || ''}
            </Text>
          </View>
        );

      case 'socialButton': {
        const allowed = ALLOWED_PROVIDERS.has(
          component.provider
        );

        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.socialButton,
               dynamic.socialButton,
              (!allowed || submitting) && styles.disabled,
            ]}
            disabled={!allowed || submitting}
            onPress={() =>
              onSocialAuth?.(component.provider)
            }
          >
            <Text style={[styles.socialText, dynamic.socialText]}>
              {component.label}
            </Text>
          </TouchableOpacity>
        );
      }

      case 'footerLink': {
        const allowed = ALLOWED_ACTIONS.has(component.action);

        return (
          <TouchableOpacity
            key={key}
            disabled={!allowed || submitting}
            onPress={() => onAction?.(component.action)}
          >
            <Text style={[styles.footer, dynamic.footer]}>
              {component.text}{' '}
              <Text style={[styles.footerAction, dynamic.footerAction]}>
                {component.actionText}
              </Text>
            </Text>
          </TouchableOpacity>
        );
      }

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, dynamic.container]}>
      {schema.components.map(renderComponent)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#E5E7EB',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: '#A6ADB8',
    textAlign: 'center',
  },
  input: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: '#343B45',
    backgroundColor: '#171B21',
    borderRadius: 15,
    paddingHorizontal: 18,
    marginBottom: 17,
    color: '#F8FAFC',
    fontSize: 16,
  },
  button: {
    minHeight: 60,
    borderRadius: 15,
    backgroundColor: '#C7CBD2',
    borderWidth: 1,
    borderColor: '#EEF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 16,
  },
  buttonText: {
    color: '#111318',
    fontWeight: '800',
    fontSize: 17,
  },
  disabled: {
    opacity: 0.45,
  },
  link: {
    color: '#C8CDD5',
    textAlign: 'center',
    paddingVertical: 14,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  divider: {
    alignItems: 'center',
    paddingVertical: 22,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#AEB6C1',
  },
  dividerText: {
    color: '#C7CBD2',
    fontSize: 12,
    fontWeight: '600',
  },
  socialButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#444B56',
    backgroundColor: '#111419',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  socialText: {
    color: '#E4E7EB',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#A7AFBA',
    paddingVertical: 22,
  },
  footerAction: {
    color: '#C7CBD2',
    fontWeight: '800',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
