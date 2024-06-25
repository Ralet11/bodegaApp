import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, useColorScheme, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Axios from 'react-native-axios/lib/axios';
import { useSelector } from 'react-redux';
import { API_URL } from '@env';

const MyCoupons = () => {
  const navigation = useNavigation();
  const token = useSelector((state) => state?.user.userInfo.data.token);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await Axios.get(`${API_URL}/api/discounts/getByUserId`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200 && response.data.length > 0) {
          setCoupons(response.data);
        }
      } catch (error) {
        console.error(error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [token]);

  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color={colorScheme === 'dark' ? '#FFD700' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle]}>My Coupons</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFD700' : '#333'} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {coupons.length === 0 ? (
            <View style={styles.noCouponsContainer}>
             
              <Text style={styles.noCouponsText}>No coupons available</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Start Ordering</Text>
              </TouchableOpacity>
              <Text style={styles.tipText}>Tip: Explore our menu to find new offers and discounts!</Text>
            </View>
          ) : (
            coupons.map((coupon, index) => (
              <View key={index} style={[styles.card]}>
                <Text style={[styles.cardTitle]}>{coupon.title}</Text>
                <Text style={[styles.cardDescription]}>{coupon.description}</Text>
                <Text style={[styles.cardExpiry]}>
                  Expires on: {new Date(coupon.expiryDate).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const commonStyles = {
  container: {
    flex: 1,
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  noCouponsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noCouponsImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  noCouponsText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  orderButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 20,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  card: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 16,
    marginVertical: 10,
  },
  cardExpiry: {
    fontSize: 14,
    fontStyle: 'italic',
  },
};

const stylesDark = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#1e1e1e',
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#333',
    borderBottomColor: '#555',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#fff',
  },
  noCouponsText: {
    ...commonStyles.noCouponsText,
    color: '#fff',
  },
  noCouponsImage: {
    ...commonStyles.noCouponsImage,
  },
  orderButton: {
    ...commonStyles.orderButton,
  },
  orderButtonText: {
    ...commonStyles.orderButtonText,
    color: '#000',
  },
  tipText: {
    ...commonStyles.tipText,
  },
  card: {
    ...commonStyles.card,
    backgroundColor: '#333',
  },
  cardTitle: {
    ...commonStyles.cardTitle,
    color: '#fff',
  },
  cardDescription: {
    ...commonStyles.cardDescription,
    color: '#fff',
  },
  cardExpiry: {
    ...commonStyles.cardExpiry,
    color: '#fff',
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff',
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#333',
  },
  noCouponsText: {
    ...commonStyles.noCouponsText,
    color: '#333',
  },
  noCouponsImage: {
    ...commonStyles.noCouponsImage,
  },
  orderButton: {
    ...commonStyles.orderButton,
  },
  orderButtonText: {
    ...commonStyles.orderButtonText,
    color: '#000',
  },
  tipText: {
    ...commonStyles.tipText,
  },
  card: {
    ...commonStyles.card,
    backgroundColor: '#fff',
  },
  cardTitle: {
    ...commonStyles.cardTitle,
    color: '#333',
  },
  cardDescription: {
    ...commonStyles.cardDescription,
    color: '#333',
  },
  cardExpiry: {
    ...commonStyles.cardExpiry,
    color: '#333',
  },
});

export default MyCoupons;
