import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import {
  BaseThemeProvider,
  BaseWindow,
  BaseWindowBody,
  BaseWindowTitle,
} from './window';

export type WindowSlotContent = ReactNode | HTMLElement;

export type WindowLifecycleStatus =
  | 'initializing'
  | 'visible'
  | 'hidden'
  | 'destroyed';

export type WindowCreateOptions = Readonly<Record<string, never>>;

export interface WindowContent {
  readonly title: WindowSlotContent;
  readonly body: WindowSlotContent;
  readonly statusBar: WindowSlotContent;
}

export interface WindowInstance {
  readonly id: string;
  readonly status: WindowLifecycleStatus;
  show(): void;
  hide(): void;
  update(
    next: Partial<Pick<WindowContent, 'title' | 'body' | 'statusBar'>>,
  ): void;
  destroy(): void;
}

interface WindowRecord {
  readonly id: string;
  readonly geometry: WindowGeometry;
  nativeElements: readonly HTMLElement[];
  content: WindowContent;
  status: WindowLifecycleStatus;
}

interface WindowGeometry {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const HOST_CLASS_NAME = 'sb-window-manager-host';
const MISSING_DOCUMENT_ERROR = 'WindowManager requires a browser document';
const NATIVE_REUSE_ERROR = 'HTMLElement is already used by another active window';
const DESTROYED_INSTANCE_ERROR = 'Window instance has been destroyed';

let nextWindowId = 1;

function getBrowserDocument(): Document {
  if (typeof document === 'undefined') {
    throw new Error(MISSING_DOCUMENT_ERROR);
  }

  return document;
}

function isNativeElement(content: WindowSlotContent): content is HTMLElement {
  return typeof HTMLElement !== 'undefined' && content instanceof HTMLElement;
}

function collectNativeElements(content: WindowContent): HTMLElement[] {
  return [content.title, content.body, content.statusBar].filter(isNativeElement);
}

function NativeSlot({ element }: { readonly element: HTMLElement }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    container.appendChild(element);

    return () => {
      if (element.parentElement === container) {
        container.removeChild(element);
      }
    };
  }, [element]);

  return <div ref={containerRef} />;
}

function WindowSlot({ content }: { readonly content: WindowSlotContent }) {
  return isNativeElement(content) ? <NativeSlot element={content} /> : content;
}

interface WindowManagerAppProps {
  readonly windows: readonly WindowRecord[];
  readonly onCloseWindow: (id: string) => void;
}

function WindowManagerApp({ windows, onCloseWindow }: WindowManagerAppProps) {
  return (
    <BaseThemeProvider>
      {windows.map((windowRecord) => (
        <div
          className="sb-window-manager-window"
          data-window-id={windowRecord.id}
          key={windowRecord.id}
          style={{ display: windowRecord.status === 'hidden' ? 'none' : undefined }}
        >
          <div
            className="sb-window-manager-geometry"
            data-height={windowRecord.geometry.height}
            data-width={windowRecord.geometry.width}
            data-x={windowRecord.geometry.x}
            data-y={windowRecord.geometry.y}
          />
          <BaseWindow
            height={windowRecord.geometry.height}
            width={windowRecord.geometry.width}
            x={windowRecord.geometry.x}
            y={windowRecord.geometry.y}
          >
            <BaseWindowTitle
              closable
              onClose={() => onCloseWindow(windowRecord.id)}
            >
              <WindowSlot content={windowRecord.content.title} />
            </BaseWindowTitle>
            <BaseWindowBody>
              <WindowSlot content={windowRecord.content.body} />
            </BaseWindowBody>
            <div className="sb-window-manager-status-bar">
              <WindowSlot content={windowRecord.content.statusBar} />
            </div>
          </BaseWindow>
        </div>
      ))}
    </BaseThemeProvider>
  );
}

export class WindowManager {
  private readonly activeNativeElements = new WeakSet<HTMLElement>();

  private readonly windows = new Map<string, WindowRecord>();

  private readonly instances = new Map<string, WindowInstance>();

  private nextCreationIndex = 0;

  private hostElement?: HTMLElement;

  private ownsHostElement = false;

  private root?: Root;

  createWindow(
    title: WindowSlotContent,
    body: WindowSlotContent,
    statusBar: WindowSlotContent,
    options?: WindowCreateOptions,
  ): WindowInstance {
    void options;

    const content: WindowContent = { title, body, statusBar };
    const nativeElements = collectNativeElements(content);
    this.validateNativeElements(nativeElements);

    this.ensureHost();

    for (const element of nativeElements) {
      this.activeNativeElements.add(element);
    }

    const id = `sb-window-${nextWindowId}`;
    const creationIndex = this.nextCreationIndex;
    nextWindowId += 1;
    this.nextCreationIndex += 1;

    const windowRecord: WindowRecord = {
      id,
      geometry: {
        x: 48 + creationIndex * 24,
        y: 48 + creationIndex * 24,
        width: 400,
        height: 300,
      },
      content,
      nativeElements,
      status: 'initializing',
    };

    const instance: WindowInstance = {
      id,
      get status() {
        return windowRecord.status;
      },
      show: () => {
        this.assertWindowActive(windowRecord);
        windowRecord.status = 'visible';
        this.render();
      },
      hide: () => {
        this.assertWindowActive(windowRecord);
        windowRecord.status = 'hidden';
        this.render();
      },
      update: (next) => {
        this.assertWindowActive(windowRecord);
        this.updateWindowContent(windowRecord, next);
        this.render();
      },
      destroy: () => {
        this.destroyWindow(id);
      },
    };

    this.windows.set(id, windowRecord);
    this.instances.set(id, instance);
    this.render();
    windowRecord.status = 'visible';

    return instance;
  }

  getWindow(id: string): WindowInstance | undefined {
    return this.instances.get(id);
  }

  getWindows(): readonly WindowInstance[] {
    return Array.from(this.instances.values());
  }

  destroyAll(): void {
    for (const id of Array.from(this.windows.keys())) {
      this.destroyWindow(id);
    }
  }

  private ensureHost(): void {
    if (this.root) {
      return;
    }

    const ownerDocument = getBrowserDocument();
    const hostElement = ownerDocument.createElement('div');

    hostElement.className = HOST_CLASS_NAME;
    hostElement.dataset.sbWindowManagerHost = 'true';
    ownerDocument.body.appendChild(hostElement);

    this.hostElement = hostElement;
    this.ownsHostElement = true;
    this.root = createRoot(hostElement);
  }

  private destroyWindow(id: string): void {
    const windowRecord = this.windows.get(id);

    if (!windowRecord) {
      return;
    }

    windowRecord.status = 'destroyed';
    this.windows.delete(id);
    this.instances.delete(id);
    this.detachNativeElements(windowRecord.nativeElements);

    if (this.windows.size === 0) {
      this.cleanupHost();
      return;
    }

    this.render();
  }

  private assertWindowActive(windowRecord: WindowRecord): void {
    if (windowRecord.status === 'destroyed') {
      throw new Error(DESTROYED_INSTANCE_ERROR);
    }
  }

  private validateNativeElements(
    nativeElements: readonly HTMLElement[],
    allowedNativeElements: ReadonlySet<HTMLElement> = new Set<HTMLElement>(),
  ): void {
    const uniqueNativeElements = new Set<HTMLElement>();

    for (const element of nativeElements) {
      if (
        uniqueNativeElements.has(element) ||
        (this.activeNativeElements.has(element) && !allowedNativeElements.has(element))
      ) {
        throw new Error(NATIVE_REUSE_ERROR);
      }

      uniqueNativeElements.add(element);
    }
  }

  private updateWindowContent(
    windowRecord: WindowRecord,
    next: Partial<Pick<WindowContent, 'title' | 'body' | 'statusBar'>>,
  ): void {
    const nextContent = { ...windowRecord.content, ...next };
    const previousNativeElements = new Set(windowRecord.nativeElements);
    const nextNativeElements = collectNativeElements(nextContent);
    const nextNativeElementSet = new Set(nextNativeElements);

    this.validateNativeElements(nextNativeElements, previousNativeElements);

    const removedNativeElements = windowRecord.nativeElements.filter(
      (element) => !nextNativeElementSet.has(element),
    );

    this.detachNativeElements(removedNativeElements);

    for (const element of nextNativeElements) {
      if (!previousNativeElements.has(element)) {
        this.activeNativeElements.add(element);
      }
    }

    windowRecord.content = nextContent;
    windowRecord.nativeElements = nextNativeElements;
  }

  private detachNativeElements(nativeElements: readonly HTMLElement[]): void {
    for (const element of nativeElements) {
      this.activeNativeElements.delete(element);

      if (this.hostElement?.contains(element)) {
        element.remove();
      }
    }
  }

  private render(): void {
    this.root?.render(
      <WindowManagerApp
        onCloseWindow={(id) => this.destroyWindow(id)}
        windows={Array.from(this.windows.values())}
      />,
    );
  }

  private cleanupHost(): void {
    this.root?.unmount();
    this.root = undefined;

    if (this.ownsHostElement) {
      this.hostElement?.remove();
    }

    this.hostElement = undefined;
    this.ownsHostElement = false;
  }
}
