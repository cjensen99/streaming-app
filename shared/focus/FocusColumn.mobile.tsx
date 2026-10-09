import { ScrollView } from 'react-native';
import type { FocusColumnProps } from './types';

/** The scrolling page (phones): a plain scroll view. */
export function FocusColumn({ contentContainerStyle, children, testID }: FocusColumnProps) {
  return (
    <ScrollView contentContainerStyle={contentContainerStyle} testID={testID}>
      {children}
    </ScrollView>
  );
}
