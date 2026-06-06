import { WindowsDesktopDemo } from './demo/windows-desktop-demo';
import { Theme } from '@system-ui-js/chameleon';
import './styles/app.css';

function App() {
  return (
    <Theme name="win98">
      <WindowsDesktopDemo />
    </Theme>
  );
}

export default App;
