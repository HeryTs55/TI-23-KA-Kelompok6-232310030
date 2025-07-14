import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadHistory = async () => {
        try {
          const stored = await AsyncStorage.getItem('loanHistory');
          if (stored) {
            setHistory(JSON.parse(stored));
          }
        } catch (err) {
          console.log('Failed to load history:', err);
        }
      };
      loadHistory();
    }, [])
  );

  const deleteEntry = async (index) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = [...history];
            updated.splice(index, 1);
            await AsyncStorage.setItem('loanHistory', JSON.stringify(updated));
            setHistory(updated);
          } catch (err) {
            console.log('Error deleting entry:', err);
          }
        },
      },
    ]);
  };

  const deleteAllEntries = () => {
    if (history.length === 0) return;
    Alert.alert(
      'Delete All',
      'Are you sure you want to delete all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('loanHistory');
              setHistory([]);
            } catch (err) {
              console.log('Error clearing history:', err);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.type}</Text>
        <TouchableOpacity onPress={() => deleteEntry(index)}>
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <Text>Amount: Rp {item.amount}</Text>
        <Text>Term: {item.term} months</Text>
        <Text>Rate: {item.rate}%</Text>
        <Text>
          {item.repaymentType ? item.repaymentType.charAt(0).toUpperCase() + item.repaymentType.slice(1) : ''}
          {': '}Rp {item.monthly}
        </Text>
        <Text>Total Interest: Rp {item.totalInterest}</Text>
        <Text>Total Payment: Rp {item.totalPayment}</Text>
        <Text>Start Date: {item.startDate}</Text>
        <Text>Pay-off Date: {item.payOff}</Text>
      </View>


      {item.timestamp && (
        <Text style={styles.timestamp}>
          Saved: {new Date(item.timestamp).toLocaleString()}
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>History</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {history.length > 0 && (
            <TouchableOpacity onPress={deleteAllEntries}>
              <Text style={styles.deleteAll}>Delete All</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowMenu(true)} style={{ marginLeft: 15 }}>
            <Text style={styles.sideMenu}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history found.</Text>
          </View>
        }
      />

      <Modal transparent visible={showMenu} animationType="slide">
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        >
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>Menu</Text>
            <TouchableOpacity onPress={() => { setShowMenu(false); navigation.navigate('Home'); }}>
              <Text style={styles.drawerItem}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowMenu(false); navigation.navigate('CompareList'); }}>
              <Text style={styles.drawerItem}>Compare List</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Text style={styles.drawerClose}>✖ Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  deleteAll: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
    sideMenu: {
    fontSize: 28,
    color: '#4BA3C7',
  },
  backdrop: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4BA3C7',
  },
  drawer: {
    width: '50%',
    backgroundColor: '#fff',
    paddingVertical: 50,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: -2, height: 0 },
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
    color: '#4BA3C7',
  },
  drawerItem: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  drawerClose: {
    marginTop: 40,
    fontSize: 16,
    color: '#4BA3C7',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4BA3C7',
  },
  details: {
    gap: 4,
  },
  timestamp: {
    marginTop: 10,
    fontSize: 12,
    color: '#777',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
  },
});
