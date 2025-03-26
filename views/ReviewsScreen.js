import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ReviewCard from '../components/ReviewsCards'; // Adjust path if necessary
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ReviewScreen = () => {
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { shop, reviews } = route.params || {};
  const token = useSelector((state) => state?.user?.userInfo.data.token);

  const toggleInfoModal = () => {
    setInfoModalVisible(!infoModalVisible);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#fff', '#f9f9f9']}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                Alert.alert('Cannot go back');
              }
            }}
          >
            <Icon name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Reviews</Text>
          
          <TouchableOpacity style={styles.infoButton} onPress={toggleInfoModal}>
            <Icon name="information-circle-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Background pattern */}
      <View style={styles.backgroundPattern}>
        {Array(5).fill().map((_, i) => (
          <View key={i} style={styles.patternRow}>
            {Array(10).fill().map((_, j) => (
              <View key={j} style={styles.patternDot} />
            ))}
          </View>
        ))}
      </View>

      {/* Reviews list or "no reviews" message */}
      <ScrollView 
        contentContainerStyle={styles.reviewList}
        showsVerticalScrollIndicator={false}
      >
        {shop && (
          <View style={styles.shopInfoContainer}>
            <Text style={styles.shopName}>{shop.name || 'Shop Details'}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#ff9900" />
              <Text style={styles.ratingText}>
                {shop.rating || '0'} ({shop.reviewCount || '0'} reviews)
              </Text>
            </View>
          </View>
        )}
        
        {reviews && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <View key={index} style={styles.reviewCardWrapper}>
              <ReviewCard review={review} />
              {index < reviews.length - 1 && <View style={styles.reviewDivider} />}
            </View>
          ))
        ) : (
          <View style={styles.noReviewsContainer}>
            <View style={styles.noReviewsIconContainer}>
              <Icon name="chatbubble-ellipses-outline" size={50} color="#B0B0B0" />
            </View>
            <Text style={styles.noReviewsText}>There are no reviews for this place yet.</Text>
            <TouchableOpacity style={styles.writeReviewButton}>
              <Text style={styles.writeReviewText}>Write the first review</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Info Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={infoModalVisible}
        onRequestClose={toggleInfoModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="information-circle" size={30} color="#ff9900" />
              <Text style={styles.modalTitle}>About Reviews</Text>
            </View>
            <View style={styles.modalDivider} />
            <Text style={styles.modalText}>
              This screen displays all reviews for the selected place. Reviews are sorted by relevance and include ratings and comments from users who have visited this location.
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={toggleInfoModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goBackButton: {
    padding: 8,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  infoButton: {
    padding: 8,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    zIndex: -1,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
  },
  patternDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff9900',
    opacity: 0.5,
  },
  shopInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  reviewList: {
    padding: 15,
    paddingBottom: 30,
  },
  reviewCardWrapper: {
    marginBottom: 15,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  noReviewsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  noReviewsIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  writeReviewButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ff9900',
    shadowColor: '#ff9900',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  writeReviewText: {
    color: '#ff9900',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
    marginVertical: 15,
  },
  modalText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
    color: '#555',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ReviewScreen;