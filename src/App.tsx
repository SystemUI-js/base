import { useMemo, useRef, useState } from 'react';

import {
  BaseThemeProvider,
  BaseWindow,
  BaseWindowActionButton,
  BaseWindowBody,
  BaseWindowTitle,
  windowManager,
} from '@system-ui-js/base';

import './styles/app.css';

const runtimeModes = ['监控模式', '调试模式', '发布模式'] as const;

type RuntimeMode = (typeof runtimeModes)[number];

type FocusTask = {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
};

type LogEntry = {
  readonly id: number;
  readonly message: string;
};

const focusTasks = [
  {
    id: 'exports',
    label: '公共导出校验',
    detail:
      '确认 Demo 通过 @system-ui-js/base 消费 Window 能力，而非引用深层实现文件。',
  },
  {
    id: 'build',
    label: '双目标构建',
    detail: '分别生成 npm 包产物与 Demo 站点产物，确保发布与展示链路互不污染。',
  },
  {
    id: 'theme',
    label: '主题适配',
    detail:
      '复用 Chameleon 的 Windows 主题，并通过基础包适配层维持统一语义入口。',
  },
] as const satisfies readonly FocusTask[];

const initialLogEntries = [
  '工作区准备完成，可开始切换运行模式。',
  '当前 Demo 已通过基础包公开 API 渲染 Window 场景。',
  '独立库构建与 Demo 构建脚本已拆分。',
] as const;

function getNextRuntimeMode(mode: RuntimeMode): RuntimeMode {
  const currentIndex = runtimeModes.indexOf(mode);
  const nextIndex = (currentIndex + 1) % runtimeModes.length;

  return runtimeModes[nextIndex] ?? runtimeModes[0];
}

function App() {
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>('监控模式');
  const [selectedTaskId, setSelectedTaskId] = useState<FocusTask['id']>(
    focusTasks[0].id,
  );
  const [refreshCount, setRefreshCount] = useState(1);
  const nextLogEntryIdRef = useRef(initialLogEntries.length);
  const [logEntries, setLogEntries] = useState<LogEntry[]>(() =>
    initialLogEntries.map((message, index) => ({ id: index, message })),
  );
  const [inspectorVisible, setInspectorVisible] = useState(true);
  const [managedWindowCount, setManagedWindowCount] = useState(0);

  const selectedTask = useMemo(
    () =>
      focusTasks.find((task) => task.id === selectedTaskId) ?? focusTasks[0],
    [selectedTaskId],
  );

  const statusToneClassName = useMemo(() => {
    switch (runtimeMode) {
      case '监控模式':
        return 'is-primary';
      case '调试模式':
        return 'is-accent';
      case '发布模式':
        return 'is-warning';
      default:
        return 'is-primary';
    }
  }, [runtimeMode]);

  const summaryMetrics = [
    { label: '公开入口', value: '@system-ui-js/base' },
    { label: '当前模式', value: runtimeMode },
    { label: '刷新次数', value: `${refreshCount} 次` },
  ] as const;

  function prependLogEntry(message: string) {
    const logEntry: LogEntry = {
      id: nextLogEntryIdRef.current,
      message,
    };

    nextLogEntryIdRef.current += 1;
    setLogEntries((currentEntries) =>
      [logEntry, ...currentEntries].slice(0, 4),
    );
  }

  function handleRefreshSummary() {
    setRefreshCount((count) => count + 1);
    prependLogEntry('摘要面板已刷新，最新窗口指标同步完成。');
  }

  function handleCycleRuntimeMode() {
    const nextMode = getNextRuntimeMode(runtimeMode);

    setRuntimeMode(nextMode);
    prependLogEntry(`运行模式已切换为 ${nextMode}。`);
  }

  function handleSelectTask(taskId: FocusTask['id']) {
    const task = focusTasks.find((item) => item.id === taskId);

    setSelectedTaskId(taskId);
    if (task) {
      prependLogEntry(`当前聚焦：${task.label}。`);
    }
  }

  function handleToggleInspector() {
    const nextVisible = !inspectorVisible;

    setInspectorVisible(nextVisible);
    prependLogEntry(
      nextVisible ? '辅助窗口已恢复显示。' : '辅助窗口已最小化。',
    );
  }

  function handleCreateManagedWindow() {
    const nextCount = managedWindowCount + 1;

    setManagedWindowCount(nextCount);

    const title = (
      <span>
        🪟 动态窗口 #{nextCount}
      </span>
    );

    const body = (
      <div style={{ padding: '12px' }}>
        <p style={{ margin: '0 0 8px' }}>
          这是通过 <code>windowManager.createWindow</code> 创建的动态窗口。
        </p>
        <p style={{ margin: 0, color: '#666' }}>
          序号：{nextCount}
        </p>
      </div>
    );

    const statusBar = (
      <span style={{ fontSize: '12px', color: '#888' }}>
        状态：已创建 · 由 WindowManager 托管
      </span>
    );

    windowManager.createWindow(title, body, statusBar, {});
    prependLogEntry(`已创建动态管理窗口 #${nextCount}。`);
  }

  return (
    <BaseThemeProvider theme="win98">
      <main className="app-shell">
        <div className="workspace-backdrop" />
        <section className="workspace-stage" aria-label="Window Demo 工作区">
          <BaseWindow x={64} y={48} width={660} height={500}>
            <BaseWindowTitle
              action={
                <BaseWindowActionButton
                  onClick={handleCycleRuntimeMode}
                  variant="ghost"
                >
                  切换模式
                </BaseWindowActionButton>
              }
            >
              Base Workspace
            </BaseWindowTitle>
            <BaseWindowBody>
              <div className="sb-base-window-shell">
                <header className="sb-base-window-toolbar">
                  <div className="sb-base-window-heading">
                    <span className="sb-base-window-kicker">
                      @system-ui-js/base
                    </span>
                    <h1 className="sb-base-window-title">Window 首屏展示</h1>
                    <p className="sb-base-window-subtitle">
                      通过基础包公开导出面封装 Chameleon Window 能力，并在 Demo
                      中完成独立展示与交互反馈。
                    </p>
                  </div>
                  <div className="sb-base-window-actions">
                    <BaseWindowActionButton
                      onClick={handleRefreshSummary}
                      variant="primary"
                    >
                      刷新摘要
                    </BaseWindowActionButton>
                    <BaseWindowActionButton onClick={handleToggleInspector}>
                      {inspectorVisible ? '隐藏辅助窗' : '显示辅助窗'}
                    </BaseWindowActionButton>
                    <BaseWindowActionButton
                      onClick={handleCreateManagedWindow}
                      variant="primary"
                    >
                      创建管理窗口
                    </BaseWindowActionButton>
                  </div>
                </header>

                <div className="sb-base-window-grid">
                  {summaryMetrics.map((metric) => (
                    <article
                      className="sb-base-window-metric"
                      key={metric.label}
                    >
                      <span className="sb-base-window-metric-label">
                        {metric.label}
                      </span>
                      <span className="sb-base-window-metric-value">
                        {metric.value}
                      </span>
                    </article>
                  ))}
                </div>

                <div className="sb-base-window-panels">
                  <section className="sb-base-window-panel">
                    <div className="sb-base-window-section-header">
                      <h2 className="sb-base-window-section-title">
                        当前任务聚焦
                      </h2>
                      <span
                        className={`sb-base-window-status ${statusToneClassName}`}
                      >
                        {runtimeMode}
                      </span>
                    </div>
                    <div className="sb-base-window-task-list">
                      {focusTasks.map((task) => (
                        <button
                          className={`sb-base-window-task-button${
                            task.id === selectedTaskId ? ' is-active' : ''
                          }`}
                          key={task.id}
                          onClick={() => handleSelectTask(task.id)}
                          type="button"
                        >
                          <span className="sb-base-window-task-label">
                            {task.label}
                          </span>
                          <span className="sb-base-window-task-text">
                            {task.detail}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="sb-base-window-panel">
                    <div className="sb-base-window-section-header">
                      <h2 className="sb-base-window-section-title">实现摘要</h2>
                      <span className="sb-base-window-section-meta">
                        实时反馈
                      </span>
                    </div>
                    <p className="sb-base-window-task-text">
                      {selectedTask.detail}
                    </p>
                    <div className="sb-base-window-log">
                      {logEntries.map((entry) => (
                        <div
                          className="sb-base-window-log-entry"
                          key={entry.id}
                        >
                          {entry.message}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </BaseWindowBody>
          </BaseWindow>

          {inspectorVisible ? (
            <BaseWindow x={500} y={110} width={320} height={250}>
              <BaseWindowTitle
                action={
                  <BaseWindowActionButton
                    onClick={handleToggleInspector}
                    variant="ghost"
                  >
                    最小化
                  </BaseWindowActionButton>
                }
              >
                Inspector
              </BaseWindowTitle>
              <BaseWindowBody>
                <div className="inspector-panel">
                  <p className="inspector-label">当前关注项</p>
                  <strong className="inspector-value">
                    {selectedTask.label}
                  </strong>
                  <p className="inspector-detail">{selectedTask.detail}</p>
                  <div className="inspector-actions">
                    <BaseWindowActionButton
                      onClick={handleRefreshSummary}
                      variant="primary"
                    >
                      同步状态
                    </BaseWindowActionButton>
                    <BaseWindowActionButton onClick={handleCycleRuntimeMode}>
                      推进模式
                    </BaseWindowActionButton>
                  </div>
                </div>
              </BaseWindowBody>
            </BaseWindow>
          ) : null}
        </section>
      </main>
    </BaseThemeProvider>
  );
}

export default App;
