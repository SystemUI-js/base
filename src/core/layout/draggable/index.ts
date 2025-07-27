import { Number2 } from '../../../types';

interface Options {
	// 可以扩展选项，比如是否禁用拖拽等
	disabled?: boolean;
	// 实际被拖拽的组件
	movedElement?: HTMLElement;
}

interface Events {
	start?: (mousePos: Number2) => void,
	move?: (mousePos: Number2) => void,
	end?: (mousePos: Number2) => void,
}

function setElementPosition(element: HTMLElement, position: Number2) {
	element.style.left = position.x + 'px';
	element.style.top = position.y + 'px';
}

export function makeDraggable(
	ele: HTMLElement,
	events: Events = {},
	options: Options = {}
) {
	let isDragging = false;
	let offset: Number2 = { x: 0, y: 0 }; // 记录鼠标相对于元素的偏移量

	// 确定实际要移动的元素
	const targetElement = options.movedElement || ele;

	// 获取鼠标位置的工具函数
	const getMousePosition = (event: MouseEvent): Number2 => ({
		x: event.clientX,
		y: event.clientY
	});

	// 获取元素当前位置
	const getElementPosition = (element: HTMLElement): Number2 => {
		const rect = element.getBoundingClientRect();
		return {
			x: rect.left,
			y: rect.top
		};
	};

	// 鼠标按下事件处理
	const handleMouseDown = (event: MouseEvent) => {
		console.log('mouseDown');
		if (options.disabled) return;

		event.preventDefault();
		isDragging = true;

		const mousePos = getMousePosition(event);
		// 使用实际要移动的元素来计算偏移量
		const elementPos = getElementPosition(targetElement);

		// 计算鼠标相对于目标元素左上角的偏移量
		offset = {
			x: mousePos.x - elementPos.x,
			y: mousePos.y - elementPos.y
		};

		events.start?.(mousePos);

		// 添加全局事件监听器
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	// 鼠标移动事件处理
	const handleMouseMove = (event: MouseEvent) => {
		if (!isDragging) return;
		console.log('mouseMove', event);

		event.preventDefault();
		const mousePos = getMousePosition(event);

		// 根据鼠标位置和偏移量计算元素新位置
		const newPosition = {
			x: mousePos.x - offset.x,
			y: mousePos.y - offset.y
		};

		// 移动实际的目标元素
		setElementPosition(targetElement, newPosition);
		events.move?.(mousePos);
	};

	// 鼠标抬起事件处理
	const handleMouseUp = (event: MouseEvent) => {
		if (!isDragging) return;

		isDragging = false;
		const mousePos = getMousePosition(event);

		// 最后一次更新位置
		const newPosition = {
			x: mousePos.x - offset.x,
			y: mousePos.y - offset.y
		};
		setElementPosition(targetElement, newPosition);

		events.end?.(mousePos);

		// 移除全局事件监听器
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};

	// 为触发元素（拖拽手柄）添加鼠标按下事件监听器
	ele.addEventListener('mousedown', handleMouseDown);

	// 返回清理函数，用于移除事件监听器
	const cleanup = () => {
		ele.removeEventListener('mousedown', handleMouseDown);
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	};

	// 返回包含清理函数和相关元素的对象
	return {
		triggerElement: ele,    // 触发拖拽的元素
		targetElement,          // 实际移动的元素
		cleanup
	};
}
