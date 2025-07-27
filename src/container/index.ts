import './index.css';

export class Container {
	private readonly containerDOM: HTMLDivElement;
	// 默认撑满
	constructor(parent: HTMLElement) {
		this.containerDOM = document.createElement('div');
		this.containerDOM.className = 'sys-ui_container';
		parent.appendChild(this.containerDOM);
	}
}

export function initContainer(parent: HTMLElement) {
	return new Container(parent);
}
