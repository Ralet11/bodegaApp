import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../redux/slices/orders.slice';
import { useNavigation } from '@react-navigation/native';

const OrderScreen = () => {
  const orders = useSelector((state) => state?.orders.historicOrders);
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user.userInfo.data.client);
  const token = useSelector((state) => state?.user.userInfo.data.token);
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const styles = scheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    if (user) {
      dispatch(getAllOrders(user.id, token));
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      <ScrollView>
        {orders && orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.cardHeader}>Order #{order.id}</Text>
            <Text style={styles.status}>{order.status}</Text>
            <Text style={styles.date}>{order.date_time}</Text>
            <Text style={styles.total}>Total Price: ${order.total_price}</Text>
            <Text style={styles.localInfo}>{order.local.name}</Text>
            <View style={styles.itemsContainer}>
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsText}>Details</Text>
                <TouchableOpacity>
                  <Text style={styles.detailsLink}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const commonStyles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 8,
  },
  localInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemsContainer: {
    marginTop: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsLink: {
    fontSize: 16,
    color: '#ffcc00',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
};

const lightStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#f0f0f0',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    shadowColor: '#000',
  },
  backButtonText: {
    ...commonStyles.backButtonText,
    color: '#000',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#000',
  },
  cardHeader: {
    ...commonStyles.cardHeader,
    color: '#000',
  },
  status: {
    ...commonStyles.status,
    color: '#4caf50',
  },
  date: {
    ...commonStyles.date,
    color: '#666',
  },
  localInfo: {
    ...commonStyles.localInfo,
    color: '#333',
  },
  detailsText: {
    ...commonStyles.detailsText,
    color: '#000',
  },
  total: {
    ...commonStyles.total,
    color: '#000',
  },
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#121212',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    shadowColor: '#fff',
  },
  backButtonText: {
    ...commonStyles.backButtonText,
    color: '#fff',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#fff',
  },
  cardHeader: {
    ...commonStyles.cardHeader,
    color: '#fff',
  },
  status: {
    ...commonStyles.status,
    color: '#4caf50',
  },
  date: {
    ...commonStyles.date,
    color: '#aaa',
  },
  localInfo: {
    ...commonStyles.localInfo,
    color: '#ccc',
  },
  detailsText: {
    ...commonStyles.detailsText,
    color: '#fff',
  },
  total: {
    ...commonStyles.total,
    color: '#fff',
  },
});

export default OrderScreen;