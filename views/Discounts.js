import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Axios from 'react-native-axios/lib/axios';
import { useSelector } from 'react-redux';
import { API_URL } from '@env';

const MyCoupons = ({ scheme }) => {
  const navigation = useNavigation();
  const token = useSelector((state) => state?.user.userInfo.data.token);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await Axios.get(`${API_URL}/api/discounts/getByUserId`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          if(response.data.length > 0) {
            setCoupons([response.data]);
          }
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

  return (
    <SafeAreaView style={[styles.container, scheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color={scheme === 'dark' ? '#FFD700' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, scheme === 'dark' ? styles.darkTitle : styles.lightTitle]}>My Coupons</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={scheme === 'dark' ? '#FFD700' : '#333'} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {coupons.length === 0 ? (
            <Text style={[styles.noCouponsText, scheme === 'dark' ? styles.darkText : styles.lightText]}>
              No coupons used yet.
            </Text>
          ) : (
            coupons.map((coupon, index) => (
              <View key={index} style={[styles.card, scheme === 'dark' ? styles.darkCard : styles.lightCard]}>
                <Text style={[styles.cardTitle, scheme === 'dark' ? styles.darkText : styles.lightText]}>{coupon.title}</Text>
                <Text style={[styles.cardDescription, scheme === 'dark' ? styles.darkText : styles.lightText]}>{coupon.description}</Text>
                <Text style={[styles.cardExpiry, scheme === 'dark' ? styles.darkText : styles.lightText]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  darkTitle: {
    color: '#fff',
  },
  lightTitle: {
    color: '#333',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#1e1e1e',
  },
  noCouponsText: {
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 20,
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
  lightCard: {
    backgroundColor: '#fff',
  },
  darkCard: {
    backgroundColor: '#333',
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
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#333',
  },
});

export default MyCoupons;