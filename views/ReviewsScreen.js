import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '@env'; // Ensure you have your API URL configured
import ReviewCard from '../components/ReviewsCards'; // Adjust the import path as needed
import Axios from 'react-native-axios';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView

const filters = ['Relevant', 'Recent', 'Highest Rated', 'Lowest Rated'];

const ReviewScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('Relevant');
  
  const navigation = useNavigation();
  const route = useRoute();
  const { shop, reviews } = route.params || {};
  const token = useSelector((state) => state?.user?.userInfo.data.token);



  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with the title */}
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
      </View>

      {/* Filters */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          style={styles.filterContainer}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContentContainer}
        >
          {filters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonSelected,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List of reviews or "no reviews" message */}
      <ScrollView contentContainerStyle={styles.reviewList}>
        {reviews.length > 0 ? (
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
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  goBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterWrapper: {
    height: 40,
    marginVertical: 20,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 0,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  filterButton: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonSelected: {
    backgroundColor: '#FFC107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    color: '#757575',
  },
  filterTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
    fontSize: 16,
    color: '#B0B0B0',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ReviewScreen;
