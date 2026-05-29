import { useCallback, useState } from 'react';
import {
  CButton,
  CStartBar,
  CStatusBar,
  CStatusBarItem,
  CWindow,
  CWindowBody,
  CWindowTitle,
} from '@system-ui-js/chameleon';

interface WindowInstance {
  readonly id: string;
  readonly title: string;
  readonly x: number;
  readonly y: number;
}

export function WindowsDesktopDemo() {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [nextWindowId, setNextWindowId] = useState(1);

  const handleCreateWindow = useCallback(() => {
    const newWindow: WindowInstance = {
      id: `window-${nextWindowId}`,
      title: `窗口 ${nextWindowId}`,
      x: 100 + (windows.length * 30) % 200,
      y: 100 + (windows.length * 30) % 150,
    };

    setWindows((prev) => [...prev, newWindow]);
    setNextWindowId((prev) => prev + 1);
  }, [nextWindowId, windows.length]);

  const handleCloseWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  return (
    <div className="windows-desktop">
      <div className="desktop-area">
        {windows.map((window) => (
          <CWindow
            key={window.id}
            x={window.x}
            y={window.y}
            width={400}
            height={300}
          >
            <CWindowTitle
              actionButton={
                <CButton
                  onClick={() => handleCloseWindow(window.id)}
                  aria-label="关闭"
                >
                  ×
                </CButton>
              }
            >
              {window.title}
            </CWindowTitle>
            <CWindowBody>
              <div className="window-content">
                <p>这是 {window.title} 的内容区域</p>
                <p>窗口 ID: {window.id}</p>
              </div>
            </CWindowBody>
          </CWindow>
        ))}
      </div>

      <CStartBar startLabel="开始" height={40}>
        <CButton onClick={handleCreateWindow}>
          开始
        </CButton>

        <CStatusBar>
          {windows.map((window) => (
            <CStatusBarItem key={window.id}>
              <CButton
                onClick={() => {
                  console.log('聚焦窗口:', window.id);
                }}
              >
                {window.title}
              </CButton>
            </CStatusBarItem>
          ))}
        </CStatusBar>
      </CStartBar>
    </div>
  );
}
