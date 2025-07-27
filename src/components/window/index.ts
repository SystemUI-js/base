import { makeDraggable } from '../../core/layout/draggable';
import { Number2 } from '../../types';
import { indexManager } from '../../core/layout/indexManager';
import { makeResizable } from '../../core/layout/resizable';

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
	private isAlwaysToFront: boolean = false;
	constructor(children: SysUiContent, options: Options, initSize?: Number2, initPosition?: Number2) {
		this.element = document.createElement('div')
		this.element.className = `sys-ui_window ${options.className}`
		// 根据initSize初始尺寸
		this.element.style.width = (initSize?.x || 100) + 'px'
		this.element.style.height = (initSize?.y || 100) + 'px'
		// 设置初始位置，默认为 (0,0)
		this.element.style.left = (initPosition?.x || 0) + 'px'
		this.element.style.top = (initPosition?.y || 0) + 'px'
		// 确保元素是绝对定位的
		this.element.style.position = 'absolute'

		indexManager.addItem(this, INDEX_GROUP_NAME)
		// 把children.content添加到this.element中
		if (children.titleBar) this.element.appendChild(children.titleBar);
		if (children.content) this.element.appendChild(children.content);
		if (children.statusBar) this.element.appendChild(children.statusBar);
		if (children.titleBar) makeDraggable(children.titleBar, {}, {
			movedElement: this.element
		})
		makeResizable(this.element, {}, {})
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
		if (!this.isAlwaysToFront) indexManager.bringToFront(this, INDEX_GROUP_NAME);
	}
	// 永远置顶
	alwaysToFront() {
		this.isAlwaysToFront = true;
		indexManager.setAlwaysOnTop(this, INDEX_GROUP_NAME);
	}
	protected abstract beforeCreated?(): void
	protected abstract afterCreated?(): void
	protected abstract beforeDestroyed?(): void
	protected abstract afterDestroyed?(): void
}
