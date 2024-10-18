import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const { width } = Dimensions.get('window');

// Tema personalizado
const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#E6B000', // Color primario personalizado
  },
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabWidth = (width - 40) / state.routes.length; // Ajuste para el padding lateral
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // Asegura que haya espacio suficiente en iOS
          backgroundColor: '#FFFFFF',
        },
      ]}
    >
      <BlurView intensity={90} tint='light' style={styles.blurContainer}>
        <View style={styles.tabBarInner}>
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
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View style={styles.tabItemContainer}>
                  <MaterialCommunityIcons
                    name={options.tabBarIcon}
                    size={24}
                    color={isFocused ? theme.colors.primary : theme.colors.text}
                  />
                  <Text
                    style={[
                      styles.tabBarLabel,
                      {
                        color: isFocused ? theme.colors.primary : theme.colors.text,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

function TabNavigator() {
  const ordersIn = useSelector((state) => state.orders.ordersIn);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Restaurants"
        component={DashboardDiscounts}
        options={{
          tabBarIcon: 'food',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapViewComponent}
        options={{
          tabBarIcon: 'map',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderScreen}
        options={{
          tabBarIcon: 'clipboard-list',
          tabBarBadge: ordersIn.length > 0 ? ordersIn.length : undefined,
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer theme={customLightTheme}>
      <Stack.Navigator initialRouteName="Logo">
        <Stack.Screen
          name="Logo"
          component={LogoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Shop"
          component={ShopScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CartScreen"
          component={CartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AcceptedOrder"
          component={AcceptedOrder}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SetAddressScreen"
          component={SetAddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CategoryShops"
          component={CategoryShops}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyCoupons"
          component={MyCoupons}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Contact"
          component={Contact}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BodegaPro"
          component={BodegaPro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchShops"
          component={SearchShops}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PickUpOrderFinish"
          component={OrderSummary}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReviewSceen"
          component={ReviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PromoMealScreen"
          component={PromoMealScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 10, // Reduce el espacio inferior para iOS
    left: 10, // Reduce los márgenes laterales
    right: 10,
    elevation: 0,
    borderRadius: 15,
    height: 70, // Aumenta la altura para dar más espacio a los iconos
    overflow: 'hidden', // Evita que los elementos se desborden
    backgroundColor: 'transparent', // Establece el fondo transparente para el BlurView
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  blurContainer: {
    flex: 1,
    borderRadius: 15, // Asegura que el BlurView también tenga las esquinas redondeadas
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  slider: {
    height: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 10,
  },
  tabItem: {
    flex: 1,
    height: '100%',
  },
  tabItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
