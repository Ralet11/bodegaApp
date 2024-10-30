import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { NavigationContainer, DefaultTheme, useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importa tus componentes de pantalla
import DashboardDiscounts from './views/DashboardDiscounts';
import MapViewComponent from './views/Map';
import OrderScreen from './views/OrdersView';
import LogoScreen from './views/LogoScreens';
import Login from './views/Login';
import ShopScreen from './views/Shop';
import CartScreen from './views/CartScreen';
import AcceptedOrder from './views/acceptedOrder';
import SetAddressScreen from './views/SelectAddress';
import CategoryShops from './views/CategoryShops';
import Signup from './views/SignUp';
import AccountSettings from './views/AccountSettings';
import MyCoupons from './views/Discounts';
import Contact from './views/Contact';
import BodegaPro from './views/BodegaPro';
import SearchShops from './views/SearchShops';
import OrderSummary from './views/PickUpOrderFinish';
import ReviewScreen from './views/ReviewsScreen';
import PromoMealScreen from './views/PromoMealScreen';
import colors from './components/themes/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

// Tema personalizado con colores modernos
const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: '#FF6347',
    background: '#FFFFFF',
    card: 'rgba(255, 255, 255, 0.9)',
    text: '#1A1A1A',
    border: 'rgba(0, 0, 0, 0.1)',
    notification: '#FF3B30',
  },
};

const TabIcon = ({ name, color, size, badge, isFocused }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: isFocused ? 1.2 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <MaterialCommunityIcons name={name} size={size} color={color} />
      {badge > 0 && (
        <View style={[styles.badge, { backgroundColor: customTheme.colors.notification }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const totalWidth = width - 40; // 40 es la suma de los márgenes izquierdo y derecho
  const tabWidth = totalWidth / state.routes.length;
  const translateX = useRef(new Animated.Value(0)).current;
  const ordersIn = useSelector((state) => state.orders.ordersIn);

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      friction: 4,
      tension: 40,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 10 }]}>
      <BlurView intensity={30} tint="light" style={styles.blurContainer}>
        <Animated.View
          style={[
            styles.slider,
            {
              transform: [{ translateX }],
              width: tabWidth,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? route.name;
            const isFocused = state.index === index;
            const iconName = options.tabBarIcon;
            const badge = route.name === 'Orders' ? ordersIn.length : 0;

            const onPress = () => {
              navigation.navigate(route.name);
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                style={styles.tab}
              >
                <TabIcon
                  name={iconName}
                  color={isFocused ? theme.colors.primary : theme.colors.text}
                  size={28}
                  badge={badge}
                  isFocused={isFocused}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isFocused ? theme.colors.primary : theme.colors.text,
                      opacity: isFocused ? 1 : 0.7,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Restaurants"
        component={DashboardDiscounts}
        options={{
          tabBarIcon: 'food',
          tabBarLabel: 'Restaurants',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapViewComponent}
        options={{
          tabBarIcon: 'map',
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderScreen}
        options={{
          tabBarIcon: 'clipboard-list',
          tabBarLabel: 'Orders',
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer theme={customTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: customTheme.colors.background },
        }}
        initialRouteName="Logo"
      >
        <Stack.Screen name="Logo" component={LogoScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="AcceptedOrder" component={AcceptedOrder} />
        <Stack.Screen name="SetAddressScreen" component={SetAddressScreen} />
        <Stack.Screen name="CategoryShops" component={CategoryShops} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="AccountSettings" component={AccountSettings} />
        <Stack.Screen name="MyCoupons" component={MyCoupons} />
        <Stack.Screen name="Contact" component={Contact} />
        <Stack.Screen name="BodegaPro" component={BodegaPro} />
        <Stack.Screen name="SearchShops" component={SearchShops} />
        <Stack.Screen name="PickUpOrderFinish" component={OrderSummary} />
        <Stack.Screen name="ReviewSceen" component={ReviewScreen} />
        <Stack.Screen name="PromoMealScreen" component={PromoMealScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    height: Platform.OS === 'ios' ? 120 : 70, // Incrementa la altura en iOS
    borderRadius: 35,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blurContainer: {
    flex: 1,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  slider: {
    height: 5,
    position: 'absolute',
    top: 0,
    borderRadius: 2.5,
    left: 5, // Ajuste para alinear el slider
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
});
