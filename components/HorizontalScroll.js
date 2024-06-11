import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const HorizontalScroll = ({ title, items, scheme, animationValues, handleItemPress }) => {
  const styles = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.viewMore}>See more</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {items.map((item, index) => (
          <TouchableOpacity key={index} style={styles.itemContainer} onPress={() => handleItemPress(item)}>
            <View style={[styles.card]}>
              <Image source={{ uri: item.image || item.img }} style={styles.itemImage} />
              <View style={styles.overlay}>
                <Text style={styles.discountText}>20% OFF</Text>
                <Text style={styles.distanceText}>83.4 KM</Text>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name || item.product}</Text>
                <View style={styles.addressContainer}>
                  <FontAwesome name="map-marker" size={14} color={scheme === 'dark' ? '#FFD700' : '#ff6347'} />
                  <Text style={styles.itemAddress} numberOfLines={1}>{item.address || "Av. Lope de Vega 1599"}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const commonStyles = {
  container: { marginVertical: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 15 },
  title: { fontSize: 15, fontWeight: 'bold' },
  viewMore: { fontSize: 14, color: '#ff6347' },
  scrollView: {},
  itemContainer: { marginRight: 15, padding: 5 },
  card: { width: 250, height: 180, backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5 },
  itemImage: { width: '100%', height: 100 },
  overlay: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  discountText: { color: '#FFD700', fontWeight: 'bold', fontSize: 12 },
  distanceText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginTop: 5 },
  itemContent: { padding: 10, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  addressContainer: { flexDirection: 'row', alignItems: 'center' },
  itemAddress: { fontSize: 14, marginLeft: 5 },
};

const lightTheme = StyleSheet.create({
  ...commonStyles,
  title: { ...commonStyles.title, color: '#333' },
  viewMore: { ...commonStyles.viewMore },
  card: { ...commonStyles.card, backgroundColor: '#fff' },
  itemName: { ...commonStyles.itemName, color: '#333' },
  itemAddress: { ...commonStyles.itemAddress, color: '#666' },
});

const darkTheme = StyleSheet.create({
  ...commonStyles,
  title: { ...commonStyles.title, color: '#fff' },
  viewMore: { ...commonStyles.viewMore, color: '#ff6347' },
  card: { ...commonStyles.card, backgroundColor: '#333' },
  itemName: { ...commonStyles.itemName, color: '#fff' },
  itemAddress: { ...commonStyles.itemAddress, color: '#bbb' },
});

export default HorizontalScroll;