import { describe, expect, it, jest } from '@jest/globals';
import { createInputDispatcher } from '../../input/dispatcher';
import type { InputHandler } from '../../input/keys';

const handles: InputHandler = () => 'handled';
const passes: InputHandler = () => 'pass';

describe('input dispatcher', () => {
  it('offers a press to the newest layer first, and stops when one handles it', () => {
    const dispatcher = createInputDispatcher();
    const older = jest.fn(handles);
    const newer = jest.fn(handles);
    dispatcher.addLayer(older);
    dispatcher.addLayer(newer);

    expect(dispatcher.dispatch({ key: 'back' })).toBe('handled');
    expect(newer).toHaveBeenCalledWith({ key: 'back' });
    expect(older).not.toHaveBeenCalled();
  });

  it('passes a press down the layers, then to the fallback', () => {
    const dispatcher = createInputDispatcher();
    const calls: string[] = [];
    dispatcher.setFallback(() => (calls.push('fallback'), 'handled'));
    dispatcher.addLayer(() => (calls.push('older'), 'pass'));
    dispatcher.addLayer(() => (calls.push('newer'), 'pass'));

    expect(dispatcher.dispatch({ key: 'select' })).toBe('handled');
    expect(calls).toEqual(['newer', 'older', 'fallback']);
  });

  it('returns pass when nothing handles a press', () => {
    const dispatcher = createInputDispatcher();
    dispatcher.addLayer(passes);
    expect(dispatcher.dispatch({ key: 'up' })).toBe('pass');

    dispatcher.setFallback(passes);
    expect(dispatcher.dispatch({ key: 'up' })).toBe('pass');
  });

  it('removes a layer, and removing one twice is harmless', () => {
    const dispatcher = createInputDispatcher();
    const layer = jest.fn(handles);
    const remove = dispatcher.addLayer(layer);

    remove();
    remove();

    expect(dispatcher.dispatch({ key: 'back' })).toBe('pass');
    expect(layer).not.toHaveBeenCalled();
  });

  it('still asks the next layer when a layer removes itself while handling', () => {
    const dispatcher = createInputDispatcher();
    const lower = jest.fn(handles);
    dispatcher.addLayer(lower);
    const removeUpper = dispatcher.addLayer(() => {
      removeUpper();
      return 'pass';
    });

    expect(dispatcher.dispatch({ key: 'back' })).toBe('handled');
    expect(lower).toHaveBeenCalledTimes(1);
  });

  it('replaces the fallback, and clears it with null', () => {
    const dispatcher = createInputDispatcher();
    const first = jest.fn(handles);
    const second = jest.fn(handles);
    dispatcher.setFallback(first);
    dispatcher.setFallback(second);
    dispatcher.dispatch({ key: 'back' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);

    dispatcher.setFallback(null);
    expect(dispatcher.dispatch({ key: 'back' })).toBe('pass');
  });
});
