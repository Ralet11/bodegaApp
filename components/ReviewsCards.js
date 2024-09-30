import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const ReviewCard = ({ review }) => {
  const [showFullReview, setShowFullReview] = useState(false);

  return (
    <View style={styles.card}>
      {/* Header con el nombre del usuario y la fecha */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.user.name[0]}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.user.name}</Text>
          <Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={14} color="#FFC107" />
          <Text style={styles.ratingText}>{review.rating}</Text>
        </View>
      </View>

      {/* Contenido de la reseña */}
      <View style={styles.content}>
        <Text style={styles.reviewText} numberOfLines={showFullReview ? 0 : 3}>
          {review.message ? review.message : 'Sin comentarios adicionales'}
        </Text>
        {review.message && review.message.length > 100 && (
          <TouchableOpacity style={styles.readMore} onPress={() => setShowFullReview(!showFullReview)}>
            <Text style={styles.readMoreText}>{showFullReview ? 'Ver menos' : 'Ver más'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="thumb-up" size={20} color="#FFC107" />
          <Text style={styles.actionText}>Útil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="report" size={20} color="#FFC107" />
          <Text style={styles.actionText}>Reportar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Estilos del componente
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    color: '#6D4C41',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#757575',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  content: {
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#424242',
  },
  readMore: {
    marginTop: 5,
  },
  readMoreText: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#FFC107',
    fontWeight: 'bold',
  },
});

export default ReviewCard;
