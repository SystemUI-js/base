import { SysUiComponents } from '../../../types';

const BASE_Z_INDEX = 1000;

interface IndexGroup {
  items: Map<SysUiComponents, number>;
  maxIndex: number;
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
      group = { items: new Map(), maxIndex: BASE_Z_INDEX };
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

    const newIndex = ++group.maxIndex;
    group.items.set(component, newIndex);
    this.applyStyle(component, newIndex);
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

    // 找到最小的 z-index
    let minIndex = BASE_Z_INDEX;
    for (const index of group.items.values()) {
      if (index < minIndex) {
        minIndex = index;
      }
    }

    const newIndex = minIndex - 1;
    group.items.set(component, newIndex);
    this.applyStyle(component, newIndex);
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
}

export const indexManager = new IndexManager();
