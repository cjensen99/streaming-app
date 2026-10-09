import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import type { RootStackParamList } from '../types/navigation';
import { device } from '../utils/device';
import { DetailScreen } from './detail/DetailScreen';
import { HomeScreen } from './home/HomeScreen';
import { PlayerScreen } from './player/PlayerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions: NativeStackNavigationOptions = { headerShown: false };

// Phones get a header on Detail with just a back arrow; TVs go back with the remote.
const detailOptions: NativeStackNavigationOptions = device.isTV
  ? {}
  : {
      headerShown: true,
      title: '',
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal',
    };

// Fades in over the menus, full screen. A pushed screen rather than a native modal: tvOS remote
// presses only reach the app from the main view hierarchy, where the focus anchor is. No
// swipe-back on iOS: the Back control or Back button closes it. Android phones hide the status
// and navigation bars; iPhones hide the status bar in landscape by themselves (and the
// navigator's `statusBarHidden` would need view-controller-based status bar appearance there).
const playerOptions: NativeStackNavigationOptions = {
  animation: 'fade',
  gestureEnabled: false,
  statusBarHidden: Platform.OS === 'android',
  navigationBarHidden: true,
};

/** Home → Detail → Player. */
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} options={detailOptions} />
      <Stack.Screen name="Player" component={PlayerScreen} options={playerOptions} />
    </Stack.Navigator>
  );
}
