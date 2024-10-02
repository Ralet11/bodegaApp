import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme, StyleSheet, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Dashboard from './views/Dashboard';
import BurgerSignUpScreen from './views/SignUp';
import BurgerLoginScreen from './views/Login';
import ShopScreen from './views/Shop';
import LogoScreen from './views/LogoScreens';
import Login from './views/Login';
import CartScreen from './views/CartScreen';
import AcceptedOrder from './views/acceptedOrder';
import SetAddressScreen from './views/SelectAddress';
import MapViewComponent from './views/Map';
import OrderScreen from './views/OrdersView';
import CategoryShops from './views/CategoryShops';
import Signup from './views/SignUp';
import AccountSettings from './views/AccountSettings';
import MyCoupons from './views/Discounts';
import Contact from './views/Contact';
import BodegaPro from './views/BodegaPro';
import SearchShops from './views/SearchShops';
import DiscountDetailView from './views/DiscountDetailView';
import DashboardDiscounts from './views/DashboardDiscounts';
import OrderSummary from './views/PickUpOrderFinish';
import DiscountDetailScreen from './components/DiscountDetail';
import ReviewScreen from './views/ReviewsScreen';
import PromoMealScreen from './views/PromoMealScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const scheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'walk' : 'walk';
          } else if (route.name === 'Discounts') {
            iconName = focused ? 'ticket-percent' : 'ticket-percent';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'view-list' : 'view-list';
          }else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;

        },
        tabBarActiveTintColor: '#FFC300',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: scheme === 'dark' ? styles.tabBarDark : styles.tabBar,
        tabBarLabelStyle: scheme === 'dark' ? styles.tabBarLabelDark : styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      })}
    >

      <Tab.Screen
        name="Discounts"
        component={DashboardDiscounts}
        options={{ tabBarLabel: 'Dine-in' }}
      />
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{ tabBarLabel: 'Pickup' }}
      />
      <Tab.Screen
        name="Map"
        component={MapViewComponent}
        options={{ tabBarLabel: 'Map' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderScreen}
        options={{ tabBarLabel: 'Orders' }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
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
          name="MapScreen"
          component={MapViewComponent}
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
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderTopWidth: 0,
    elevation: 15,
    height: 60,
    margin: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 0, // Ensures padding for iOS
  },
  tabBarDark: {
    position: 'absolute',
    backgroundColor: 'rgba(28, 28, 28, 0.9)',
    borderTopWidth: 0,
    elevation: 35,
    height: 60,
    margin: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Ensures padding for iOS
  },
  tabBarLabel: {
    fontSize: 12,
    marginBottom: Platform.OS === 'ios' ? 5 : 5, // Adjusts label position for iOS
    color: 'black',
  },
  tabBarLabelDark: {
    fontSize: 12,
    marginBottom: Platform.OS === 'ios' ? 5 : 5, // Adjusts label position for iOS
    color: 'white',
  },
  tabBarIcon: {
    marginTop: Platform.OS === 'ios' ? -10 : 5, // Ensures icon position for iOS
  },
});
