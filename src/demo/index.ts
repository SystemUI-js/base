import { initContainer } from '../container';
import { SysUiWindow } from '../components/window';
import './index.css';

class DemoWindow extends SysUiWindow {
  protected afterDestroyed?(): void {
      throw new Error('Method not implemented.');
  }
	beforeCreated() {
		console.log('beforeCreated');
	}
	afterCreated() {
		console.log('afterCreated');
	}
	beforeDestroyed() {
		console.log('beforeDestroyed');
	}
}

const appElement = document.querySelector('#app');
if (appElement) {
	const container = initContainer(appElement as HTMLElement);
	const text1 = document.createElement('span');
	text1.innerText = 'Hello World';
	const window1 = new DemoWindow({
		titleBar: text1
	}, {
		className: 'sys-ui_window-demo'
	}, {
		x: 200,
		y: 200
	}, {
		x: 150,
		y: 60
	});
	container.addComponent(window1);
	const text2 = document.createElement('span');
	text2.innerText = 'Hello World';
	const window2 = new DemoWindow({
		titleBar: text2
	}, {
		className: 'sys-ui_window-demo'
	}, {
		x: 400,
		y: 400
	}, {
		x: 300,
		y: 100
	});
	container.addComponent(window2);
	const text3 = document.createElement('span');
	text3.innerText = '永远顶层';
	const window3 = new DemoWindow({
		titleBar: text3
	}, {
		className: 'sys-ui_window-demo'
	}, {
		x: 800,
		y: 400
	}, {
		x: 40,
		y: 200
	});
	container.addComponent(window3);
	window3.alwaysToFront();
	console.log(container);
} else {
	console.error('找不到 #app 元素');
}
