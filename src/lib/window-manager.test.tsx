import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { WindowInstance } from './window-manager';
import { WindowManager } from './window-manager';

let managers: WindowManager[] = [];

function createManager(): WindowManager {
  const manager = new WindowManager();

  managers.push(manager);

  return manager;
}

function getHost(): HTMLElement | null {
  return document.querySelector('[data-sb-window-manager-host="true"]');
}

afterEach(() => {
  act(() => {
    for (const manager of managers) {
      manager.destroyAll();
    }
  });

  managers = [];
});

describe('WindowManager browser host', () => {
  it('returns a visible instance after creation', () => {
    const manager = createManager();
    let windowInstance: WindowInstance | undefined;

    act(() => {
      windowInstance = manager.createWindow('Title', 'Body', 'Status');
    });

    expect(windowInstance?.status).toBe('visible');
  });

  it('renders multiple windows and returns all active instances', async () => {
    const manager = createManager();
    const firstWindow = await act(async () =>
      manager.createWindow('First title', 'First body', 'First status'),
    );
    const secondWindow = await act(async () =>
      manager.createWindow('Second title', 'Second body', 'Second status'),
    );

    expect(document.querySelectorAll('.sb-window-manager-window')).toHaveLength(2);
    expect(manager.getWindows()).toEqual([firstWindow, secondWindow]);
  });

  it('passes deterministic geometry through to each rendered window', async () => {
    const manager = createManager();

    await act(async () => {
      manager.createWindow('First title', 'First body', 'First status');
      manager.createWindow('Second title', 'Second body', 'Second status');
    });

    const geometries = document.querySelectorAll('.sb-window-manager-geometry');

    expect(geometries[0]?.getAttribute('data-x')).toBe('48');
    expect(geometries[0]?.getAttribute('data-y')).toBe('48');
    expect(geometries[0]?.getAttribute('data-width')).toBe('400');
    expect(geometries[0]?.getAttribute('data-height')).toBe('300');
    expect(geometries[1]?.getAttribute('data-x')).toBe('72');
    expect(geometries[1]?.getAttribute('data-y')).toBe('72');
    expect(geometries[1]?.getAttribute('data-width')).toBe('400');
    expect(geometries[1]?.getAttribute('data-height')).toBe('300');
  });

  it('hides and shows only the selected window', async () => {
    const manager = createManager();
    const firstWindow = await act(async () =>
      manager.createWindow('First title', 'First body', 'First status'),
    );
    const secondWindow = await act(async () =>
      manager.createWindow('Second title', 'Second body', 'Second status'),
    );

    act(() => {
      firstWindow.hide();
    });

    expect(firstWindow.status).toBe('hidden');
    expect(secondWindow.status).toBe('visible');

    act(() => {
      firstWindow.show();
    });

    expect(firstWindow.status).toBe('visible');
    expect(secondWindow.status).toBe('visible');
  });

  it('updates body content without changing the window id', async () => {
    const manager = createManager();
    const windowInstance = await act(async () =>
      manager.createWindow('Title', 'Initial body', 'Status'),
    );
    const originalId = windowInstance.id;

    await act(async () => {
      windowInstance.update({ body: <section>Updated body</section> });
    });

    expect(windowInstance.id).toBe(originalId);
    expect(screen.queryByText('Initial body')).toBeNull();
    expect(document.body.contains(screen.getByText('Updated body'))).toBe(true);
  });

  it('updates native HTMLElement tracking when replacing slot content', async () => {
    const manager = createManager();
    const originalBody = document.createElement('article');
    const nextBody = document.createElement('section');

    originalBody.textContent = 'Original native body';
    nextBody.textContent = 'Next native body';

    const windowInstance = await act(async () =>
      manager.createWindow('Title', originalBody, 'Status'),
    );

    await act(async () => {
      windowInstance.update({ body: nextBody });
    });

    expect(originalBody.parentElement).toBeNull();
    expect(document.body.contains(screen.getByText('Next native body'))).toBe(true);

    const reusedWindow = await act(async () =>
      manager.createWindow('Second title', originalBody, 'Second status'),
    );

    expect(reusedWindow.status).toBe('visible');
    expect(document.body.contains(screen.getByText('Original native body'))).toBe(true);
  });

  it('throws when update reuses a native element from another active window', async () => {
    const manager = createManager();
    const sharedBody = document.createElement('article');

    sharedBody.textContent = 'Shared native body';

    const firstWindow = await act(async () =>
      manager.createWindow('First title', 'First body', 'First status'),
    );

    await act(async () => {
      manager.createWindow('Second title', sharedBody, 'Second status');
    });

    expect(() => {
      firstWindow.update({ body: sharedBody });
    }).toThrow('HTMLElement is already used by another active window');
    expect(document.body.contains(screen.getByText('First body'))).toBe(true);
  });

  it('destroys only the selected window and allows repeated destroy calls', async () => {
    const manager = createManager();
    const firstWindow = await act(async () =>
      manager.createWindow('First title', 'First body', 'First status'),
    );
    const secondWindow = await act(async () =>
      manager.createWindow('Second title', 'Second body', 'Second status'),
    );

    await act(async () => {
      firstWindow.destroy();
      firstWindow.destroy();
    });

    expect(firstWindow.status).toBe('destroyed');
    expect(manager.getWindow(firstWindow.id)).toBeUndefined();
    expect(manager.getWindow(secondWindow.id)).toBe(secondWindow);
    expect(manager.getWindows()).toEqual([secondWindow]);
    expect(screen.queryByText('First title')).toBeNull();
    expect(document.body.contains(screen.getByText('Second title'))).toBe(true);
  });

  it('destroys all windows and clears the host', async () => {
    const manager = createManager();
    const firstWindow = await act(async () =>
      manager.createWindow('First title', 'First body', 'First status'),
    );
    const secondWindow = await act(async () =>
      manager.createWindow('Second title', 'Second body', 'Second status'),
    );

    await act(async () => {
      manager.destroyAll();
    });

    expect(firstWindow.status).toBe('destroyed');
    expect(secondWindow.status).toBe('destroyed');
    expect(manager.getWindows()).toEqual([]);
    expect(getHost()).toBeNull();
  });

  it('throws clear lifecycle errors after destroy', async () => {
    const manager = createManager();
    const windowInstance = await act(async () =>
      manager.createWindow('Title', 'Body', 'Status'),
    );

    act(() => {
      windowInstance.destroy();
    });

    expect(() => windowInstance.show()).toThrow('Window instance has been destroyed');
    expect(() => windowInstance.hide()).toThrow('Window instance has been destroyed');
    expect(() => windowInstance.update({ body: 'Updated body' })).toThrow(
      'Window instance has been destroyed',
    );
  });

  it('renders React slot content in title, body, and status slots', async () => {
    const manager = createManager();

    await act(async () => {
      manager.createWindow(
        <span>React title</span>,
        <section>React body</section>,
        <small>React status</small>,
      );
    });

    expect(document.body.contains(screen.getByText('React title'))).toBe(true);
    expect(document.body.contains(screen.getByText('React body'))).toBe(true);
    expect(document.body.contains(screen.getByText('React status'))).toBe(true);
  });

  it('renders native HTMLElement slot content and detaches it after destroy', async () => {
    const manager = createManager();
    const title = document.createElement('strong');
    const body = document.createElement('article');
    const status = document.createElement('span');

    title.textContent = 'Native title';
    body.textContent = 'Native body';
    status.textContent = 'Native status';

    const windowInstance = await act(async () => manager.createWindow(title, body, status));

    expect(document.body.contains(screen.getByText('Native title'))).toBe(true);
    expect(document.body.contains(screen.getByText('Native body'))).toBe(true);
    expect(document.body.contains(screen.getByText('Native status'))).toBe(true);

    await act(async () => {
      windowInstance.destroy();
    });

    expect(title.parentElement).toBeNull();
    expect(body.parentElement).toBeNull();
    expect(status.parentElement).toBeNull();
  });

  it('throws when reusing the same native element in another active window', () => {
    const manager = createManager();
    const nativeElement = document.createElement('div');

    act(() => {
      manager.createWindow('First title', nativeElement, 'First status');
    });

    expect(() => {
      manager.createWindow('Second title', nativeElement, 'Second status');
    }).toThrow('HTMLElement is already used by another active window');
  });

  it('creates a manager-owned host for the first window', () => {
    const manager = createManager();

    expect(getHost()).toBeNull();

    let windowInstance: WindowInstance | undefined;

    act(() => {
      windowInstance = manager.createWindow('Title', 'Body', 'Status');
    });
    const host = getHost();

    expect(host).not.toBeNull();
    expect(host?.className).toBe('sb-window-manager-host');
    expect(host?.dataset.sbWindowManagerHost).toBe('true');
    expect(windowInstance?.status).toBe('visible');
  });

  it('removes the host after destroying the final window', async () => {
    const manager = createManager();
    const firstWindow = await act(async () =>
      manager.createWindow('First title', 'First body', 'First status'),
    );
    const secondWindow = await act(async () =>
      manager.createWindow('Second title', 'Second body', 'Second status'),
    );

    expect(getHost()).not.toBeNull();

    await act(async () => {
      firstWindow.destroy();
    });

    expect(getHost()).not.toBeNull();

    await act(async () => {
      secondWindow.destroy();
    });

    expect(getHost()).toBeNull();
  });

  it('throws when creating a window without a browser document', () => {
    const manager = createManager();
    const originalDocument = globalThis.document;

    Reflect.deleteProperty(globalThis, 'document');

    try {
      expect(() => {
        manager.createWindow('Title', 'Body', 'Status');
      }).toThrow('WindowManager requires a browser document');
    } finally {
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: originalDocument,
        writable: true,
      });
    }
  });

  it('destroys a window when clicking the close button', async () => {
    const manager = createManager();
    const windowInstance = await act(async () =>
      manager.createWindow('Title', 'Body', 'Status'),
    );

    const closeButton = screen.getByLabelText('Close');

    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(windowInstance.status).toBe('destroyed');
    expect(manager.getWindow(windowInstance.id)).toBeUndefined();
  });

  it('renders status bar content in sb-window-manager-status-bar', async () => {
    const manager = createManager();

    await act(async () => {
      manager.createWindow('Title', 'Body', 'Status text');
    });

    const statusBar = document.querySelector('.sb-window-manager-status-bar');

    expect(statusBar).not.toBeNull();
    expect(statusBar?.textContent).toBe('Status text');
  });

  it('renders hidden windows with display none', async () => {
    const manager = createManager();
    const windowInstance = await act(async () =>
      manager.createWindow('Title', 'Body', 'Status'),
    );

    act(() => {
      windowInstance.hide();
    });

    const windowElement = document.querySelector('.sb-window-manager-window');

    expect(windowElement).toBeTruthy();
    expect((windowElement as HTMLElement).style.display).toBe('none');
  });
});
