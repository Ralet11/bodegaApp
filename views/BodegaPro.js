import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BodegaPro = ({ navigation }) => {
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  console.log(user)

  const isSubscribed = user.subscription === 1;
  const benefits = [
    'Free shipping',
    'Tax discounts',
    'Exclusive promotions',
    // Add more benefits here
  ];

  const handleCancelSubscription = () => {
    // Logic to cancel the subscription
    alert('Logic to cancel the subscription');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        {isSubscribed ? (
          <>
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Thank you for being a part of Bodega+ Pro!</Text>
              <Text style={styles.headerText}>You have saved</Text>
              <Text style={styles.savingsAmount}>$150</Text>
              <Text style={styles.headerText}>thanks to Bodega+ Pro</Text>
            </View>
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Exclusive Benefits</Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <FontAwesome name="check-circle" size={24} color="#ff9900" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={handleCancelSubscription}>
              <Text style={styles.cancelLink}>Cancel subscription</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.joinCard}>
              <Text style={styles.joinTitle}>Join Bodega+ Pro now for only $10.99</Text>
              <Text style={styles.joinSubtitle}>Unlock these benefits</Text>
            </View>
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Exclusive Benefits</Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <FontAwesome name="lock" size={24} color="#ff9900" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.subscribeButton} onPress={() => alert('Start subscription logic')}>
              <Text style={styles.subscribeButtonText}>Start Subscription</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    marginTop: 30
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f6f8',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  headerCard: {
    backgroundColor: '#ff9900',
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    marginTop: 5,
  },
  savingsAmount: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    width: width * 0.9,
    alignSelf: 'center',
  },
  benefitText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 15,
    flexShrink: 1,
  },
  cancelLink: {
    fontSize: 18,
    color: '#ff9900',
    marginTop: 30,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  joinCard: {
    backgroundColor: '#ff9900',
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  joinTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  joinSubtitle: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    marginTop: 5,
  },
  subscribeButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  subscribeButtonText: {
    fontSize: 18,
    color: '#ff9900',
    fontWeight: 'bold',
  },
});

export default BodegaPro;