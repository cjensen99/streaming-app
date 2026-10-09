import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { device } from '../utils/device';
import { DetailScreen } from './detail/DetailScreen';
import { HomeScreen } from './home/HomeScreen';

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

/** Home → Detail. (The player joins in Phase 11, tabs in Phase 12.) */
export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} options={detailOptions} />
    </Stack.Navigator>
  );
}
