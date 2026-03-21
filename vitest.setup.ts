import '@testing-library/jest-dom';
import { vi } from 'vitest';

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}
(window as any).PointerEvent = MockPointerEvent;
(window as any).HTMLElement.prototype.scrollIntoView = vi.fn();
(window as any).HTMLElement.prototype.hasPointerCapture = vi.fn();
(window as any).HTMLElement.prototype.releasePointerCapture = vi.fn();

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(window as any).ResizeObserver = MockResizeObserver;
