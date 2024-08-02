import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, useColorScheme, Image, Switch } from 'react-native';
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
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
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

  const getDeliveryTag = (delivery) => {
    switch (delivery) {
      case 0:
        return 'Pick-up';
      case 1:
        return 'Delivery';
      case 2:
        return 'Order-in';
      default:
        return '';
    }
  };

  const filteredCoupons = filter === 'all' ? coupons : coupons.filter(coupon => coupon.discount.delivery === filter);
  const displayedCoupons = showAll ? filteredCoupons : filteredCoupons.filter(coupon => !coupon.used);

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color={colorScheme === 'dark' ? '#FFD700' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle]}>My Coupons</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilter('all')}>
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilter(1)}>
          <Text style={styles.filterButtonText}>Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilter(0)}>
          <Text style={styles.filterButtonText}>Pick-up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilter(2)}>
          <Text style={styles.filterButtonText}>Order-in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>{showAll ? 'All' : 'Not Used'}</Text>
        <Switch
          value={showAll}
          onValueChange={setShowAll}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={showAll ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#FFD700' : '#333'} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {displayedCoupons.length === 0 ? (
            <View style={styles.noCouponsContainer}>
              <Text style={styles.noCouponsText}>No coupons available</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Start Ordering</Text>
              </TouchableOpacity>
              <Text style={styles.tipText}>Tip: Explore our menu to find new offers and discounts!</Text>
            </View>
          ) : (
            displayedCoupons.map((coupon, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => navigation.navigate('Shop', { shop: coupon.discount.local })}
              >
                <View style={styles.tagContainer}>
                  <Text style={styles.tagText}>{getDeliveryTag(coupon.discount.delivery)}</Text>
                </View>
                <Image source={{ uri: coupon.discount.image }} style={styles.cardImage} />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardTitle}>{coupon.discount.productName}</Text>
                  <Text style={styles.cardDescription}>{coupon.discount.conditions}</Text>
                  <Text style={styles.cardExpiry}>
                    Expires on: {new Date(coupon.discount.limitDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.cardType}>
                    {coupon.discount.discountType === 'percentage'
                      ? `${coupon.discount.percentage}% off`
                      : `$${coupon.discount.fixedValue} off`}
                  </Text>
                  <Text style={styles.cardDescription}>Shop: {coupon.discount.local.name}</Text>
                </View>
                {coupon.used && (
                  <View style={styles.usedOverlay}>
                    <Text style={styles.usedText}>Used</Text>
                  </View>
                )}
              </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    backgroundColor: "#FFC107"
  },
  headerTitle: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: "#FFC107"
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#FFC107',
  },
  filterButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
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
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDescription: {
    fontSize: 16,
    marginVertical: 10,
    color: '#555',
  },
  cardExpiry: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006400',
    marginTop: 10,
  },
  tagContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFC107',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  usedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  usedText: {
    color: '#FFC107',
    fontSize: 24,
    fontWeight: 'bold',
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
    backgroundColor: '#333',
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
    color: '#ccc',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: '#333',
    borderColor: '#555',
  },
  cardTitle: {
    ...commonStyles.cardTitle,
    color: '#fff',
  },
  cardDescription: {
    ...commonStyles.cardDescription,
    color: '#ccc',
  },
  cardExpiry: {
    ...commonStyles.cardExpiry,
    color: '#aaa',
  },
  cardType: {
    ...commonStyles.cardType,
    color: '#90ee90',
  },
  tagContainer: {
    ...commonStyles.tagContainer,
  },
  tagText: {
    ...commonStyles.tagText,
    color: '#333333',
  },
  usedOverlay: {
    ...commonStyles.usedOverlay,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Slightly darker overlay for dark mode
  },
  usedText: {
    ...commonStyles.usedText,
    color: '#FFD700',
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
    borderColor: '#ddd',
  },
  cardTitle: {
    ...commonStyles.cardTitle,
    color: '#333',
  },
  cardDescription: {
    ...commonStyles.cardDescription,
    color: '#555',
  },
  cardExpiry: {
    ...commonStyles.cardExpiry,
    color: '#999',
  },
  cardType: {
    ...commonStyles.cardType,
    color: '#006400',
  },
  tagContainer: {
    ...commonStyles.tagContainer,
  },
  tagText: {
    ...commonStyles.tagText,
    color: '#333333',
  },
  usedOverlay: {
    ...commonStyles.usedOverlay,
  },
  usedText: {
    ...commonStyles.usedText,
  },
});

export default MyCoupons;
