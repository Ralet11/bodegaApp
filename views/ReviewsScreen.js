import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_URL } from '@env';
import ReviewCard from '../components/ReviewsCards';
import Axios from 'react-native-axios';
import { useSelector } from 'react-redux';

const filters = ['Relevant', 'Recent', 'Highest Rated', 'Lowest Rated'];

const ReviewScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('Relevant');
  const [reviews, setReviews] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { shop } = route.params || {};
  const token = useSelector((state) => state?.user?.userInfo.data.token);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await Axios.get(`${API_URL}/api/reviews/getByLocal/${shop.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
  }, [shop.id, token]);

  return (
    <View style={styles.container}>
      {/* Header with the title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
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
    </View>
  );
};

// Improved styles for a modern and cleaner design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9', // A lighter and softer background color
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 15,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    position: 'relative',
    elevation: 4, // Added shadow to the header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  goBackButton: {
    position: 'absolute',
    left: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterWrapper: {
    height: 40,
    marginVertical: 20, // Added margin so it doesn't stick to the header
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
  },
  filterButton: {
    marginRight: 10,
    paddingVertical: 8, // Reduced padding for the buttons
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.3s ease', // Smooth transition
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
  },
});

export default ReviewScreen;
