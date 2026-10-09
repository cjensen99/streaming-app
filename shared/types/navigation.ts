/** The app's screens and the parameters each one takes. */
export type RootStackParamList = {
  Home: undefined;
  Detail: { channelId: string };
};

// Registers the routes with React Navigation, so `useNavigation()` and `navigate()` are
// type-checked everywhere without passing the param list around.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- React Navigation's documented way
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- extended, not empty
    interface RootParamList extends RootStackParamList {}
  }
}
