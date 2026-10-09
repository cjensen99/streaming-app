import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { useInputLayer } from '../../hooks/useInputLayer';
import { InputProvider } from '../../input/InputProvider';
import type { InputHandler } from '../../input/keys';
import { createTestInput } from '../helpers/renderScreens';

function setup() {
  const input = createTestInput();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <InputProvider adapter={input.adapter}>{children}</InputProvider>
  );
  return { ...input, wrapper };
}

describe('useInputLayer', () => {
  it('gets presses while mounted, and stops getting them after unmount', async () => {
    const { press, wrapper } = setup();
    const handler = jest.fn<InputHandler>(() => 'handled');
    const { unmount } = await renderHook(() => useInputLayer(handler), { wrapper });

    expect(await press('select')).toBe('handled');
    expect(handler).toHaveBeenCalledWith({ key: 'select' });

    await unmount();
    expect(await press('select')).toBe('pass');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('only gets presses while enabled', async () => {
    const { press, wrapper } = setup();
    const handler = jest.fn<InputHandler>(() => 'handled');
    const { rerender } = await renderHook(
      ({ enabled }: { enabled: boolean }) => useInputLayer(handler, { enabled }),
      { wrapper, initialProps: { enabled: false } },
    );

    expect(await press('back')).toBe('pass');

    await rerender({ enabled: true });
    expect(await press('back')).toBe('handled');
  });

  it('uses the latest handler without re-adding the layer', async () => {
    const { press, wrapper } = setup();
    const first = jest.fn<InputHandler>(() => 'handled');
    const second = jest.fn<InputHandler>(() => 'handled');
    const { rerender } = await renderHook(
      ({ handler }: { handler: InputHandler }) => useInputLayer(handler),
      { wrapper, initialProps: { handler: first } },
    );

    await rerender({ handler: second });
    await press('up');

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('puts the newest layer first', async () => {
    const { press, wrapper } = setup();
    const calls: string[] = [];
    await renderHook(
      () => {
        useInputLayer(() => (calls.push('first'), 'pass'));
        useInputLayer(() => (calls.push('second'), 'handled'));
      },
      { wrapper },
    );

    await act(async () => {
      await press('back');
    });

    expect(calls).toEqual(['second']);
  });
});
