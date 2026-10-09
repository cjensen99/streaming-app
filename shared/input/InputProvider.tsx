import { type ReactNode, useEffect, useMemo, useState } from 'react';
import type { InputAdapter } from './adapters/InputAdapter';
import { createInputDispatcher } from './dispatcher';
import { InputContext } from './InputContext';

interface InputProviderProps {
  /** The platform's input, chosen by each app (`remoteAdapter` on TV, `hardwareBackAdapter` on phones). */
  adapter: InputAdapter;
  children: ReactNode;
}

/**
 * Creates the app's input dispatcher and connects the platform adapter to it. Mount it above the
 * navigation container: effects run children-first, so its Back listener registers after React
 * Navigation's and is asked first.
 */
export function InputProvider({ adapter, children }: InputProviderProps) {
  const [dispatcher] = useState(createInputDispatcher);
  useEffect(() => adapter.start(dispatcher.dispatch), [adapter, dispatcher]);
  const value = useMemo(() => ({ dispatcher, adapter }), [dispatcher, adapter]);
  return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
}
