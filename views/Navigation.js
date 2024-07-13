import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, createBottomTabNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import HomeScreen from './screens/HomeScreen';
import LogoScreen from './screens/LogoScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/signUpScreen';
import SignUpScreen2 from './screens/SingUpScreen2';
import PetsScreen from './screens/PetsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProfileEditScreen from './screens/ProfileEditScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const scheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-o';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-alt';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: scheme === 'dark' ? styles.tabBarDark : styles.tabBar,
        tabBarLabelStyle: scheme === 'dark' ? styles.tabBarLabelDark : styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="Pet" 
        component={PetsScreen} 
        options={{ tabBarLabel: 'Pets' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }} 
      />
    </Tab.Navigator>
  );
}

const Navigation = () => {

  const token = useSelector((state) => state.user.token);
  const [initialRoute, setInitialRoute] = useState('Home');

  const checkToken = async () => {
    try {
      if (!token) {
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
    }
  };

  useEffect(() => {
    checkToken();
  }, [token]);

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false
          }}
        >
         <Stack.Screen name="Logo" component={LogoScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen 
              name="Main" 
              component={TabNavigator} 
              options={{ headerShown: false }} 
            />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignUp2" component={SignUpScreen2} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}



export default Navigation;
