import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, useColorScheme, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Axios from 'react-native-axios/lib/axios';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE';

const AcceptedOrder = () => {
  const colorScheme = useColorScheme();
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const address = useSelector((state) => state?.user?.address) || '';
  const user = useSelector((state) => state.user.userInfo.data);
  const navigation = useNavigation();
  const shops = useSelector((state) => state?.setUp?.shops);
  const currentShop = useSelector((state) => state.currentShop.currentShop);

  const findCurrentShop = () => {
    for (const categoryId in shops) {
      const shop = shops[categoryId].find(shop => shop.id === currentShop);
      if (shop) {
        return shop;
      }
    }
    return null;
  };

  const currentShopDetails = findCurrentShop();
  const destination = currentShopDetails ? currentShopDetails.address : null;

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await Axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(address)}&destination=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`);
        
        if (response.data.routes.length) {
          const points = decode(response.data.routes[0].overview_polyline.points);
          const routeCoords = points.map(point => ({
            latitude: point[0],
            longitude: point[1]
          }));
          setRouteCoordinates(routeCoords);
          
          const { distance, duration } = response.data.routes[0].legs[0];
          setDistance(distance.text);
          setDuration(duration.text);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    if (address && destination) {
      fetchRoute();
    }
  }, [address, destination]);

  const decode = (t, e) => {
    let points = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  };

  return (
    <SafeAreaView style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: routeCoordinates.length > 0 ? routeCoordinates[0].latitude : -27.4695,
            longitude: routeCoordinates.length > 0 ? routeCoordinates[0].longitude : -58.8306,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {routeCoordinates.length > 0 && (
            <>
              <Marker coordinate={routeCoordinates[0]} title="User Location" />
              <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]} title="Shop Location" />
              <Polyline coordinates={routeCoordinates} strokeColor="#000" strokeWidth={3} />
            </>
          )}
        </MapView>
      )}
      <View style={[styles.infoContainer, colorScheme === 'dark' ? styles.darkInfoContainer : styles.lightInfoContainer]}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Order #1001</Text>
        </View>
        <Text style={[styles.deliveryInfo, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
          The store will handle the delivery of the order.
        </Text>
        <View style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <FontAwesome name="road" size={16} color="#007BFF" />
            <Text style={[styles.orderDetailText, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{distance}</Text>
          </View>
          <View style={styles.orderDetail}>
            <FontAwesome name="clock-o" size={16} color="#007BFF" />
            <Text style={[styles.orderDetailText, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{duration}</Text>
          </View>
          {/* <View style={styles.orderDetail}>
            <FontAwesome name="money" size={16} color="#007BFF" />
            <Text style={[styles.orderDetailText, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>5,500</Text>
          </View> */}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  lightInfoContainer: {
    backgroundColor: '#fff',
  },
  darkInfoContainer: {
    backgroundColor: '#1c1c1c',
  },
  orderInfo: {
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  deliveryInfo: {
    fontSize: 14,
    marginBottom: 15,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  orderDetail: {
    alignItems: 'center',
  },
  orderDetailText: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#dc3545',
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
    color: 'white',
  },
});

export default AcceptedOrder;