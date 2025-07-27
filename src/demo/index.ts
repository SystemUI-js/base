import { initContainer } from '../container';

const appElement = document.querySelector('#app');
if (appElement) {
	const container = initContainer(appElement as HTMLElement);
	console.log(container);
} else {
	console.error('找不到 #app 元素');
}
