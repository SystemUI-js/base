import './index.css';
import { SysUiComponents } from '../types';

export class SysUiContainer {
	private readonly containerDOM: HTMLDivElement;
	private components: SysUiComponents[] = [];
	// 默认撑满
	constructor(parent: HTMLElement) {
		this.containerDOM = document.createElement('div');
		this.containerDOM.className = 'sys-ui_container';
		parent.appendChild(this.containerDOM);
	}
	addComponent(component: SysUiComponents) {
		this.components.push(component);
		this.containerDOM.appendChild(component.getElement());
	}
	removeComponent(component: SysUiComponents) {
		this.components.splice(this.components.indexOf(component), 1);
		this.containerDOM.removeChild(component.getElement());
	}
}

export function initContainer(parent: HTMLElement) {
	return new SysUiContainer(parent);
}
