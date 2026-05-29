import { BaseThemeProvider, WindowsDesktopDemo } from '@system-ui-js/base';

import './styles/app.css';

function App() {
  return (
    <BaseThemeProvider theme="win98">
      <WindowsDesktopDemo />
    </BaseThemeProvider>
  );
}

export default App;
