import { createContext } from 'react';
import type { InputAdapter } from './adapters/InputAdapter';
import type { InputDispatcher } from './dispatcher';

export interface InputContextValue {
  dispatcher: InputDispatcher;
  adapter: InputAdapter;
}

/** Provided by `InputProvider`; read with the hooks in `shared/hooks/` (`useInputLayer`, …). */
export const InputContext = createContext<InputContextValue | null>(null);
