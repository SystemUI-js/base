import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  BaseWindow,
  BaseWindowBody,
  BaseWindowTitle,
  Screen,
  System,
} from '@system-ui-js/base';

const demoHighlights = [
  'Expo 成为仓库默认开发入口。',
  '窗口结构完全通过 @system-ui-js/base 的公开导出组合。',
  '当前首页只保留一个 Win98 风格窗口与静态说明内容。',
] as const;

function createWindowFrame(screenWidth: number, screenHeight: number) {
  const horizontalInset = 16;
  const verticalInset = 24;
  const width = Math.min(360, Math.max(280, screenWidth - horizontalInset * 2));
  const height = Math.min(420, Math.max(280, screenHeight - verticalInset * 2));

  return {
    height,
    width,
    x: Math.max(horizontalInset, Math.round((screenWidth - width) / 2)),
    y: Math.max(verticalInset, Math.round((screenHeight - height) / 2)),
  } as const;
}

export default function App() {
  const { height, width } = useWindowDimensions();
  const windowFrame = useMemo(
    () => createWindowFrame(width, height),
    [height, width],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <System>
        <Screen>
          <BaseWindow
            height={windowFrame.height}
            width={windowFrame.width}
            x={windowFrame.x}
            y={windowFrame.y}
          >
            <BaseWindowTitle>Win98 Window Demo</BaseWindowTitle>
            <BaseWindowBody>
              <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.kicker}>@system-ui-js/base</Text>
                <Text style={styles.heading}>Expo Native Demo</Text>
                <Text style={styles.lead}>
                  当前首页用于验证 System、Screen 与 BaseWindow 在 Expo
                  环境中的公开消费路径。
                </Text>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>当前展示重点</Text>
                  {demoHighlights.map((item) => (
                    <View key={item} style={styles.listItemRow}>
                      <Text style={styles.listBullet}>•</Text>
                      <Text style={styles.listItem}>{item}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </BaseWindowBody>
          </BaseWindow>
        </Screen>
      </System>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  heading: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
  kicker: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lead: {
    color: '#1f2937',
    fontSize: 14,
    lineHeight: 22,
  },
  listBullet: {
    color: '#111827',
    fontSize: 14,
    lineHeight: 20,
    marginRight: 8,
  },
  listItem: {
    color: '#1f2937',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  listItemRow: {
    flexDirection: 'row',
  },
  safeArea: {
    backgroundColor: '#008080',
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
});
