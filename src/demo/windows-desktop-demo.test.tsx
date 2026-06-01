import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WindowsDesktopDemo } from './windows-desktop-demo';

afterEach(() => {
  for (const el of document.querySelectorAll('.sb-window-manager-window')) el.remove();
  for (const el of document.querySelectorAll('.sb-window-manager-host')) el.remove();
});

function getCreateButton() {
  const buttons = screen.getAllByText('开始');
  expect(buttons.length).toBeGreaterThan(1);
  return buttons[1];
}

describe('WindowsDesktopDemo', () => {
  it('creates a window when clicking 开始 button', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    expect(document.querySelectorAll('.sb-window-manager-window').length).toBe(1);
  });

  it('closes a window via titlebar close button', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    const closeButton = document.querySelector('[aria-label="关闭"]');
    if (closeButton) {
      await act(async () => fireEvent.click(closeButton));
    }
    expect(document.querySelectorAll('.sb-window-manager-window').length).toBe(0);
  });

  it('minimizes a window via titlebar minimize button', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    const minimizeButton = screen.getByLabelText('最小化');
    await act(async () => fireEvent.click(minimizeButton));
    const wrapper = document.querySelector('.sb-window-manager-window');
    expect(wrapper?.getAttribute('data-window-state')).toBe('minimized');
  });

  it('maximizes a window via titlebar maximize button', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    const maximizeButton = screen.getByLabelText('最大化');
    await act(async () => fireEvent.click(maximizeButton));
    const wrapper = document.querySelector('.sb-window-manager-window');
    expect(wrapper?.getAttribute('data-window-state')).toBe('maximized');
    const geom = wrapper?.querySelector('.sb-window-manager-geometry');
    expect(geom?.getAttribute('data-x')).toBe('0');
    expect(geom?.getAttribute('data-y')).toBe('0');
    expect(geom?.getAttribute('data-width')).toBe('100%');
    expect(geom?.getAttribute('data-height')).toBe('100%');
  });

  it('focuses a window via status bar click', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    await act(async () => fireEvent.click(getCreateButton()));
    const statusButtons = screen.getAllByText(/窗口 \d+/);
    expect(statusButtons.length).toBeGreaterThan(0);
    await act(async () => fireEvent.click(statusButtons[0]));
    const wrappers = document.querySelectorAll('.sb-window-manager-window');
    expect(wrappers[0]?.getAttribute('data-window-active')).toBe('true');
  });

  it('brings older window to front on status bar click', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    await act(async () => fireEvent.click(getCreateButton()));
    const statusButtons = screen.getAllByText(/窗口 \d+/);
    expect(statusButtons.length).toBeGreaterThan(0);
    await act(async () => fireEvent.click(statusButtons[0]));
    const wrappers = document.querySelectorAll('.sb-window-manager-window');
    const z0 = Number(wrappers[0]?.getAttribute('data-window-z-index'));
    const z1 = Number(wrappers[1]?.getAttribute('data-window-z-index'));
    expect(z0).toBeGreaterThan(z1);
    expect(wrappers[0]?.getAttribute('data-window-active')).toBe('true');
    expect(wrappers[1]?.getAttribute('data-window-active')).toBe('false');
  });

  it('restores minimized window via status bar click', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    const minimizeButton = screen.getByLabelText('最小化');
    await act(async () => fireEvent.click(minimizeButton));
    const statusButton = document.querySelector('[data-status-minimized="true"]');
    expect(statusButton).not.toBeNull();
    await act(async () => fireEvent.click(statusButton));
    const wrapper = document.querySelector('.sb-window-manager-window');
    expect(wrapper?.getAttribute('data-window-state')).toBe('normal');
    expect(wrapper?.getAttribute('data-window-active')).toBe('true');
  });

  it('restores normal geometry after toggling maximize twice', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    const maximizeButton = screen.getByLabelText('最大化');
    await act(async () => fireEvent.click(maximizeButton));
    let wrapper = document.querySelector('.sb-window-manager-window');
    expect(wrapper?.getAttribute('data-window-state')).toBe('maximized');
    const restoreButton = screen.getByLabelText('还原');
    await act(async () => fireEvent.click(restoreButton));
    wrapper = document.querySelector('.sb-window-manager-window');
    expect(wrapper?.getAttribute('data-window-state')).toBe('normal');
    const geom = wrapper?.querySelector('.sb-window-manager-geometry');
    expect(geom?.getAttribute('data-x')).not.toBe('0');
    expect(geom?.getAttribute('data-y')).not.toBe('0');
    expect(geom?.getAttribute('data-width')).not.toBe('100%');
    expect(geom?.getAttribute('data-height')).not.toBe('100%');
  });

  it('assigns staggered positions to new windows', async () => {
    render(<WindowsDesktopDemo />);
    await act(async () => fireEvent.click(getCreateButton()));
    const geom1 = document.querySelector('.sb-window-manager-window .sb-window-manager-geometry');
    expect(geom1?.getAttribute('data-x')).toBe('30');
    expect(geom1?.getAttribute('data-y')).toBe('30');
    
    await act(async () => fireEvent.click(getCreateButton()));
    const geoms = document.querySelectorAll('.sb-window-manager-window .sb-window-manager-geometry');
    expect(geoms[1]?.getAttribute('data-x')).toBe('60');
    expect(geoms[1]?.getAttribute('data-y')).toBe('60');
  });
});


