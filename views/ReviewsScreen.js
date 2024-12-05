import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ReviewCard from '../components/ReviewsCards'; // Adjust the import path as needed
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      {/* Enhanced Header */}
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
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reviews</Text>
        
        <TouchableOpacity style={styles.infoButton} onPress={toggleInfoModal}>
          <Icon name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* List of reviews or "no reviews" message */}
      <ScrollView contentContainerStyle={styles.reviewList}>
        {reviews && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))
        ) : (
          <View style={styles.noReviewsContainer}>
            <Icon name="chatbubble-ellipses-outline" size={50} color="#B0B0B0" />
            <Text style={styles.noReviewsText}>There are no reviews for this place yet.</Text>
          </View>
        )}
      </ScrollView>

      {/* Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={toggleInfoModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>About Reviews</Text>
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

// Enhanced Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFC107', // Changed to match card style
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  goBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewList: {
    padding: 15,
  },
  noReviewsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noReviewsText: {
    fontSize: 18,
    color: '#7A7A7A',
    marginTop: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewScreen;

