import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

export default function CompareListScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadCompareList();
  }, []);

  const loadCompareList = async () => {
    const stored = await AsyncStorage.getItem('compareList');
    if (stored) {
      const parsed = JSON.parse(stored);

      const sorted = parsed.slice().sort((a, b) => parseFloat(a.totalPayment) - parseFloat(b.totalPayment));

      const updated = parsed.map(item => {
        const rank = sorted.findIndex(i => parseFloat(i.totalPayment) === parseFloat(item.totalPayment));
        let tag = '';
        if (rank === 0) tag = '🏅 Best value among compared loans';
        else if (rank === 1) tag = '👌 Moderate option';
        else if (rank === 2) tag = '⚠️ Least cost-effective option';
        return { ...item, tag };
      });

      setList(updated);
    }
  };

  const deleteItem = async (index) => {
    const updated = [...list];
    updated.splice(index, 1);
    await AsyncStorage.setItem('compareList', JSON.stringify(updated));
    setList(updated);
  };

  const renderItem = (item, index) => (
    <View key={index} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{index + 1}. {item.title}</Text>
        <TouchableOpacity onPress={() => deleteItem(index)}>
          <MaterialIcons name="delete" size={20} color="black" />
        </TouchableOpacity>
      </View>
      <Text>Loan Amount: Rp. {item.amount}</Text>
      <Text>Duration: {item.term} Months</Text>
      <Text>Int. Rate: {item.rate} %</Text>
      <Text>Monthly Payment: Rp. {item.monthly}</Text>
      <Text>Total Interest: Rp. {item.totalInterest}</Text>
      <Text>Total Payment: Rp. {item.totalPayment}</Text>
      <Text style={styles.tag}>{item.tag}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Compare List</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Text style={styles.sideMenu}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: '#888' }}>No compare data found.</Text>
          </View>
        ) : (
          list.map((item, index) => renderItem(item, index))
        )}
      </ScrollView>

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
            <TouchableOpacity onPress={() => { setShowMenu(false); navigation.navigate('History'); }}>
              <Text style={styles.drawerItem}>History</Text>
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
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
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
  tag: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#777',
  },
});
