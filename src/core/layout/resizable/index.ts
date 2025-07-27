import { Number2 } from '../../../types';

interface Options {
	// 是否禁用调整大小功能
	disabled?: boolean;
	// 实际被调整大小的元素
	resizedElement?: HTMLElement;
	// 最小尺寸限制
	minSize?: Number2;
	// 最大尺寸限制
	maxSize?: Number2;
	// 启用的调整方向，默认启用所有方向
	handles?: ResizeHandle[];
	// 调整手柄的大小（像素）
	handleSize?: number;
}

interface Events {
	start?: (mousePos: Number2, currentSize: Number2) => void;
	resize?: (mousePos: Number2, newSize: Number2) => void;
	end?: (mousePos: Number2, finalSize: Number2) => void;
}

// 调整方向枚举
type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizeState {
	isResizing: boolean;
	handle: ResizeHandle | null;
	startMousePos: Number2;
	startSize: Number2;
	startPosition: Number2;
}

function setElementSize(element: HTMLElement, size: Number2) {
	element.style.width = size.x + 'px';
	element.style.height = size.y + 'px';
}

function setElementPosition(element: HTMLElement, position: Number2) {
	element.style.left = position.x + 'px';
	element.style.top = position.y + 'px';
}

function clampSize(size: Number2, minSize?: Number2, maxSize?: Number2): Number2 {
	const result = { ...size };

	if (minSize) {
		result.x = Math.max(result.x, minSize.x);
		result.y = Math.max(result.y, minSize.y);
	}

	if (maxSize) {
		result.x = Math.min(result.x, maxSize.x);
		result.y = Math.min(result.y, maxSize.y);
	}

	return result;
}

export function makeResizable(
	ele: HTMLElement,
	events: Events = {},
	options: Options = {}
) {
	const {
		disabled = false,
		resizedElement = ele,
		minSize = { x: 50, y: 50 },
		maxSize,
		handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'],
		handleSize = 5
	} = options;

	let resizeState: ResizeState = {
		isResizing: false,
		handle: null,
		startMousePos: { x: 0, y: 0 },
		startSize: { x: 0, y: 0 },
		startPosition: { x: 0, y: 0 }
	};

	const resizeHandles: HTMLElement[] = [];

	// 获取鼠标位置的工具函数
	const getMousePosition = (event: MouseEvent): Number2 => ({
		x: event.clientX,
		y: event.clientY
	});

	// 获取元素当前尺寸
	const getElementSize = (element: HTMLElement): Number2 => {
		const rect = element.getBoundingClientRect();
		return {
			x: rect.width,
			y: rect.height
		};
	};

	// 获取元素当前位置
	const getElementPosition = (element: HTMLElement): Number2 => {
		const rect = element.getBoundingClientRect();
		return {
			x: rect.left,
			y: rect.top
		};
	};

	// 创建调整手柄
	const createResizeHandle = (handle: ResizeHandle): HTMLElement => {
		const handleElement = document.createElement('div');
		handleElement.className = `resize-handle resize-handle-${handle}`;
		handleElement.style.position = 'absolute';
		handleElement.style.backgroundColor = 'transparent';
		handleElement.style.zIndex = '1000';

		// 设置手柄位置和样式
		switch (handle) {
			case 'n':
				handleElement.style.top = `0px`;
				handleElement.style.left = `${handleSize}px`;
				handleElement.style.right = `${handleSize}px`;
				handleElement.style.height = `${handleSize}px`;
				handleElement.style.cursor = 'n-resize';
				break;
			case 's':
				handleElement.style.bottom = `0px`;
				handleElement.style.left = `${handleSize}px`;
				handleElement.style.right = `${handleSize}px`;
				handleElement.style.height = `${handleSize}px`;
				handleElement.style.cursor = 's-resize';
				break;
			case 'e':
				handleElement.style.right = `0px`;
				handleElement.style.top = `${handleSize}px`;
				handleElement.style.bottom = `${handleSize}px`;
				handleElement.style.width = `${handleSize}px`;
				handleElement.style.cursor = 'e-resize';
				break;
			case 'w':
				handleElement.style.left = `0px`;
				handleElement.style.top = `${handleSize}px`;
				handleElement.style.bottom = `${handleSize}px`;
				handleElement.style.width = `${handleSize}px`;
				handleElement.style.cursor = 'w-resize';
				break;
			case 'ne':
				handleElement.style.top = `0px`;
				handleElement.style.right = `0px`;
				handleElement.style.width = `${handleSize}px`;
				handleElement.style.height = `${handleSize}px`;
				handleElement.style.cursor = 'ne-resize';
				break;
			case 'nw':
				handleElement.style.top = `0px`;
				handleElement.style.left = `0px`;
				handleElement.style.width = `${handleSize}px`;
				handleElement.style.height = `${handleSize}px`;
				handleElement.style.cursor = 'nw-resize';
				break;
			case 'se':
				handleElement.style.bottom = `0px`;
				handleElement.style.right = `0px`;
				handleElement.style.width = `${handleSize}px`;
				handleElement.style.height = `${handleSize}px`;
				handleElement.style.cursor = 'se-resize';
				break;
			case 'sw':
				handleElement.style.bottom = `0px`;
				handleElement.style.left = `0px`;
				handleElement.style.width = `${handleSize}px`;
				handleElement.style.height = `${handleSize}px`;
				handleElement.style.cursor = 'sw-resize';
				break;
		}

		// 添加鼠标按下事件
		handleElement.addEventListener('mousedown', (event) => handleMouseDown(event, handle));

		return handleElement;
	};

	// 鼠标按下事件处理
	const handleMouseDown = (event: MouseEvent, handle: ResizeHandle) => {
		if (disabled) return;

		event.preventDefault();
		event.stopPropagation();

		resizeState.isResizing = true;
		resizeState.handle = handle;
		resizeState.startMousePos = getMousePosition(event);
		resizeState.startSize = getElementSize(resizedElement);
		resizeState.startPosition = getElementPosition(resizedElement);

		events.start?.(resizeState.startMousePos, resizeState.startSize);

		// 添加全局事件监听器
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	// 鼠标移动事件处理
	const handleMouseMove = (event: MouseEvent) => {
		if (!resizeState.isResizing || !resizeState.handle) return;

		event.preventDefault();
		const mousePos = getMousePosition(event);
		const mouseDelta = {
			x: mousePos.x - resizeState.startMousePos.x,
			y: mousePos.y - resizeState.startMousePos.y
		};

		let newSize = { ...resizeState.startSize };
		let newPosition = { ...resizeState.startPosition };

		// 根据拖拽手柄计算新尺寸和位置
		switch (resizeState.handle) {
			case 'n':
				newSize.y = resizeState.startSize.y - mouseDelta.y;
				newPosition.y = resizeState.startPosition.y + mouseDelta.y;
				break;
			case 's':
				newSize.y = resizeState.startSize.y + mouseDelta.y;
				break;
			case 'e':
				newSize.x = resizeState.startSize.x + mouseDelta.x;
				break;
			case 'w':
				newSize.x = resizeState.startSize.x - mouseDelta.x;
				newPosition.x = resizeState.startPosition.x + mouseDelta.x;
				break;
			case 'ne':
				newSize.x = resizeState.startSize.x + mouseDelta.x;
				newSize.y = resizeState.startSize.y - mouseDelta.y;
				newPosition.y = resizeState.startPosition.y + mouseDelta.y;
				break;
			case 'nw':
				newSize.x = resizeState.startSize.x - mouseDelta.x;
				newSize.y = resizeState.startSize.y - mouseDelta.y;
				newPosition.x = resizeState.startPosition.x + mouseDelta.x;
				newPosition.y = resizeState.startPosition.y + mouseDelta.y;
				break;
			case 'se':
				newSize.x = resizeState.startSize.x + mouseDelta.x;
				newSize.y = resizeState.startSize.y + mouseDelta.y;
				break;
			case 'sw':
				newSize.x = resizeState.startSize.x - mouseDelta.x;
				newSize.y = resizeState.startSize.y + mouseDelta.y;
				newPosition.x = resizeState.startPosition.x + mouseDelta.x;
				break;
		}

		// 应用尺寸限制
		const clampedSize = clampSize(newSize, minSize, maxSize);

		// 如果尺寸被限制，需要调整位置
		if (resizeState.handle.includes('w') && clampedSize.x !== newSize.x) {
			newPosition.x = resizeState.startPosition.x + (resizeState.startSize.x - clampedSize.x);
		}
		if (resizeState.handle.includes('n') && clampedSize.y !== newSize.y) {
			newPosition.y = resizeState.startPosition.y + (resizeState.startSize.y - clampedSize.y);
		}

		// 应用新尺寸和位置
		setElementSize(resizedElement, clampedSize);
		if (resizeState.handle.includes('w') || resizeState.handle.includes('n')) {
			setElementPosition(resizedElement, newPosition);
		}

		events.resize?.(mousePos, clampedSize);
	};

	// 鼠标抬起事件处理
	const handleMouseUp = (event: MouseEvent) => {
		if (!resizeState.isResizing) return;

		resizeState.isResizing = false;
		const mousePos = getMousePosition(event);
		const finalSize = getElementSize(resizedElement);

		events.end?.(mousePos, finalSize);

		resizeState.handle = null;

		// 移除全局事件监听器
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};

	// 初始化：确保元素有相对定位
	if (getComputedStyle(ele).position === 'static') {
		ele.style.position = 'relative';
	}

	// 创建所有启用的调整手柄
	handles.forEach(handle => {
		const handleElement = createResizeHandle(handle);
		ele.appendChild(handleElement);
		resizeHandles.push(handleElement);
	});

	// 返回清理函数
	const cleanup = () => {
		resizeHandles.forEach(handle => {
			handle.remove();
		});
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};

	return {
		triggerElement: ele,
		targetElement: resizedElement,
		handles: resizeHandles,
		cleanup
	};
}
