import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {
  DEFAULT_WINDOW_THEME_CLASS_NAME,
  BaseThemeProvider,
  BaseWindow,
  BaseWindowActionButton,
  BaseWindowBody,
  BaseWindowTitle,
} from '@system-ui-js/base';

export default function App() {
  const [launchCount, setLaunchCount] = useState(1);

  return (
    <BaseThemeProvider theme={DEFAULT_WINDOW_THEME_CLASS_NAME}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stage}>
          <BaseWindow
            resizeOptions={undefined}
            style={styles.window}
            theme={DEFAULT_WINDOW_THEME_CLASS_NAME}
          >
            <BaseWindowTitle
              action={undefined}
              theme={DEFAULT_WINDOW_THEME_CLASS_NAME}
            >
              @system-ui-js/base
            </BaseWindowTitle>
            <BaseWindowBody theme={DEFAULT_WINDOW_THEME_CLASS_NAME}>
              <View style={styles.body}>
                <Text style={styles.heading}>Expo Managed example</Text>
                <Text style={styles.copy}>
                  This app installs the package entry with `file:..` to exercise the
                  shipped library surface.
                </Text>
                <Text style={styles.copy}>Action count: {launchCount}</Text>
                <BaseWindowActionButton
                  onPress={() => setLaunchCount((count) => count + 1)}
                  style={undefined}
                  theme={DEFAULT_WINDOW_THEME_CLASS_NAME}
                >
                  Trigger action
                </BaseWindowActionButton>
              </View>
            </BaseWindowBody>
          </BaseWindow>
        </View>
      </SafeAreaView>
    </BaseThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#008080',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  window: {
    width: '100%',
    maxWidth: 420,
  },
  body: {
    gap: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000000',
  },
});
