import { makeDraggable } from '../../core/layout/draggable';
import { Number2 } from '../../types';
import { indexManager } from '../../core/layout/indexManager';

const INDEX_GROUP_NAME = 'window';

interface SysUiContent {
	titleBar?: HTMLElement;
	content?: HTMLElement;
	statusBar?: HTMLElement;
}

interface Options {
	className: string;
}

export abstract class SysUiWindow {
	private element: HTMLDivElement
	constructor(children: SysUiContent, options: Options, initSize?: Number2) {
		this.element = document.createElement('div')
		this.element.className = `sys-ui_window ${options.className}`
		// 根据initSize初始尺寸
		this.element.style.width = (initSize?.x || 100) + 'px'
		this.element.style.height = (initSize?.y || 100) + 'px'
		indexManager.addItem(this, INDEX_GROUP_NAME)
		// 把children.content添加到this.element中
		if (children.titleBar) this.element.appendChild(children.titleBar);
		if (children.content) this.element.appendChild(children.content);
		if (children.statusBar) this.element.appendChild(children.statusBar);
		if (children.titleBar) makeDraggable(children.titleBar, {}, {
			movedElement: this.element
		})
		this.element.addEventListener('mousedown', () => {
			this.focus()
		})
		this.beforeCreated?.()
		if (this.afterCreated) setTimeout(this.afterCreated.bind(this), 0)
	}
	getElement() {
		return this.element
	}
	// 关闭
	close() {}
	// 最大化
	maximize() {}
	// 最小化
	minimize() {}
	// 恢复
	restore() {}
	// 将窗口置于顶层
	focus() {
		indexManager.bringToFront(this, INDEX_GROUP_NAME);
	}
	// 永远置顶
	alwaysToFront() {}
	protected abstract beforeCreated?(): void
	protected abstract afterCreated?(): void
	protected abstract beforeDestroyed?(): void
	protected abstract afterDestroyed?(): void
}
