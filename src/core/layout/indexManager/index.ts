import { SysUiComponents } from '../../../types';

const BASE_Z_INDEX = 1000;
const ALWAYS_TOP_Z_INDEX = 10000; // 永远置顶的基础层级

interface IndexGroup {
  items: Map<SysUiComponents, number>;
  alwaysTopItems: Set<SysUiComponents>; // 记录永远置顶的组件
  maxIndex: number;
  maxAlwaysTopIndex: number; // 永远置顶组件的最大层级
}

class IndexManager {
  private groups = new Map<string, IndexGroup>();
  private defaultGroupName = 'default';

  /**
   * 向组中添加元素
   * @param component 组件对象
   * @param groupName 组名
   */
  public addItem(component: SysUiComponents, groupName: string = this.defaultGroupName): void {
    let group = this.groups.get(groupName);
    if (!group) {
      group = {
        items: new Map(),
        alwaysTopItems: new Set(),
        maxIndex: BASE_Z_INDEX,
        maxAlwaysTopIndex: ALWAYS_TOP_Z_INDEX
      };
      this.groups.set(groupName, group);
    }

    const index = ++group.maxIndex;
    group.items.set(component, index);
    this.applyStyle(component, index);
  }

  /**
   * 从组中移除元素
   * @param component 组件对象
   * @param groupName 组名
   */
  public removeItem(component: SysUiComponents, groupName: string = this.defaultGroupName): void {
    const group = this.groups.get(groupName);
    if (!group) {
      return;
    }
    group.items.delete(component);
    group.alwaysTopItems.delete(component);
  }

  /**
   * 提升元素层级到最顶层
   * @param component 组件对象
   * @param groupName 组名
   */
  public bringToFront(component: SysUiComponents, groupName: string = this.defaultGroupName): void {
    const group = this.groups.get(groupName);
    if (!group || !group.items.has(component)) {
      return;
    }

    // 如果是永远置顶的组件，使用永远置顶的层级
    if (group.alwaysTopItems.has(component)) {
      const newIndex = ++group.maxAlwaysTopIndex;
      group.items.set(component, newIndex);
      this.applyStyle(component, newIndex);
    } else {
      const newIndex = ++group.maxIndex;
      group.items.set(component, newIndex);
      this.applyStyle(component, newIndex);
    }
  }

  /**
   * 设置元素永远置顶
   * @param component 组件对象
   * @param groupName 组名
   */
  public setAlwaysOnTop(component: SysUiComponents, groupName: string = this.defaultGroupName): void {
    const group = this.groups.get(groupName);
    if (!group || !group.items.has(component)) {
      return;
    }

    // 如果已经是永远置顶，则不需要重复设置
    if (group.alwaysTopItems.has(component)) {
      return;
    }

    group.alwaysTopItems.add(component);
    const newIndex = ++group.maxAlwaysTopIndex;
    group.items.set(component, newIndex);
    this.applyStyle(component, newIndex);
  }

  /**
   * 取消元素永远置顶
   * @param component 组件对象
   * @param groupName 组名
   */
  public removeAlwaysOnTop(component: SysUiComponents, groupName: string = this.defaultGroupName): void {
    const group = this.groups.get(groupName);
    if (!group || !group.items.has(component)) {
      return;
    }

    group.alwaysTopItems.delete(component);
    // 将层级调整到普通层级
    const newIndex = ++group.maxIndex;
    group.items.set(component, newIndex);
    this.applyStyle(component, newIndex);
  }

  /**
   * 检查元素是否永远置顶
   * @param component 组件对象
   * @param groupName 组名
   */
  public isAlwaysOnTop(component: SysUiComponents, groupName: string = this.defaultGroupName): boolean {
    const group = this.groups.get(groupName);
    if (!group) {
      return false;
    }
    return group.alwaysTopItems.has(component);
  }

  /**
   * 降低元素层级到最底层
   * @param component 组件对象
   * @param groupName 组名
   */
  public sendToBack(component: SysUiComponents, groupName: string = this.defaultGroupName): void {
    const group = this.groups.get(groupName);
    if (!group || !group.items.has(component)) {
      return;
    }

    // 永远置顶的组件不能被发送到底层
    if (group.alwaysTopItems.has(component)) {
      return;
    }

    // 找到非永远置顶组件的最小 z-index
    let minIndex = BASE_Z_INDEX;
    for (const [comp, index] of group.items.entries()) {
      if (!group.alwaysTopItems.has(comp) && index < minIndex) {
        minIndex = index;
      }
    }

    const newIndex = minIndex - 1;
    group.items.set(component, newIndex);
    this.applyStyle(component, newIndex);
  }

  /**
   * 当有新的普通组件置顶时，确保永远置顶的组件仍然在最上层
   * @param groupName 组名
   */
  private ensureAlwaysTopItemsOnTop(groupName: string): void {
    const group = this.groups.get(groupName);
    if (!group) {
      return;
    }

    // 重新设置所有永远置顶组件的层级
    for (const component of group.alwaysTopItems) {
      const newIndex = ++group.maxAlwaysTopIndex;
      group.items.set(component, newIndex);
      this.applyStyle(component, newIndex);
    }
  }

  /**
   * 获取元素的当前层级
   * @param component 组件对象
   * @param groupName 组名
   */
  public getIndex(component: SysUiComponents, groupName: string = this.defaultGroupName): number | undefined {
    const group = this.groups.get(groupName);
    if (!group) {
      return undefined;
    }
    return group.items.get(component);
  }

  /**
   * 应用样式到组件元素
   * @param component 组件对象
   * @param index z-index 值
   */
  private applyStyle(component: SysUiComponents, index: number): void {
    const element = component.getElement();
    if (element) {
      element.style.zIndex = index.toString();
      element.style.position = element.style.position || 'absolute';
    }
  }

  /**
   * 重写 bringToFront 方法，确保永远置顶的组件始终在最上层
   */
  public bringToFrontWithAlwaysTopCheck(component: SysUiComponents, groupName: string = this.defaultGroupName): void {
    this.bringToFront(component, groupName);

    // 如果被置顶的不是永远置顶组件，需要确保永远置顶组件仍在最上层
    const group = this.groups.get(groupName);
    if (group && !group.alwaysTopItems.has(component) && group.alwaysTopItems.size > 0) {
      this.ensureAlwaysTopItemsOnTop(groupName);
    }
  }
}

export const indexManager = new IndexManager();
