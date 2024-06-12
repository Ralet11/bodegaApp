import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Loader = ({ scheme }) => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color={scheme === 'dark' ? '#FFD700' : '#333'} />
  </View>
);

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;