import {
  BaseThemeProvider,
  BaseWindow,
  BaseWindowBody,
  BaseWindowTitle,
} from '@system-ui-js/base';

import './styles/app.css';

const demoHighlights = [
  '首页默认只保留一个 Win98 主题窗口。',
  '窗口标题栏与内容区均来自 @system-ui-js/base 的公开导出。',
  '内容布局聚焦说明与排版，不再承担工作台式多面板交互。',
] as const;

function App() {
  return (
    <BaseThemeProvider theme="win98">
      <main className="app-shell">
        <div className="workspace-backdrop" />
        <section className="workspace-stage" aria-label="Win98 Window Demo">
          <BaseWindow x={0} y={0} width={720} height={460}>
            <BaseWindowTitle>Win98 Window Demo</BaseWindowTitle>
            <BaseWindowBody>
              <div className="demo-window-content">
                <p className="demo-window-kicker">@system-ui-js/base</p>
                <h1 className="demo-window-heading">
                  默认首页聚焦一个基础窗口
                </h1>
                <p className="demo-window-lead">
                  这个 Demo 默认入口只展示一个 Win98
                  主题窗口，用最小内容结构验证标题栏、内容区和基础排版在公开 API
                  下的渲染效果。
                </p>

                <div className="demo-window-copy">
                  <p>
                    页面不再包含辅助窗口、模式切换、摘要指标或日志面板，首屏视觉焦点因此回到窗口本身。
                  </p>
                  <p>
                    这让默认入口更适合作为基础能力回归验证，同时也保留了后续扩展独立演示场景的空间。
                  </p>
                </div>

                <section
                  className="demo-window-section"
                  aria-labelledby="demo-highlights"
                >
                  <h2
                    className="demo-window-section-title"
                    id="demo-highlights"
                  >
                    当前展示重点
                  </h2>
                  <ul className="demo-window-list">
                    {demoHighlights.map((item) => (
                      <li className="demo-window-list-item" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </BaseWindowBody>
          </BaseWindow>
        </section>
      </main>
    </BaseThemeProvider>
  );
}

export default App;
