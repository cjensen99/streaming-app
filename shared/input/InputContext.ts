import { createContext } from 'react';
import type { InputAdapter } from './adapters/InputAdapter';
import type { InputDispatcher } from './dispatcher';
import type { InputHandler } from './keys';

export interface InputContextValue {
  dispatcher: InputDispatcher;
  adapter: InputAdapter;
  /** Where keys go that nothing else used: the focus system (TVs). */
  focusHandler: InputHandler | undefined;
}

/** Provided by `InputProvider`; read with the hooks in `shared/hooks/` (`useInputLayer`, …). */
export const InputContext = createContext<InputContextValue | null>(null);
