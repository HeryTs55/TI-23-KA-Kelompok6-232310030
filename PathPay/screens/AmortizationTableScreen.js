import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, TextInput, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AmortizationTableScreen({ route, navigation }) {
  const { amount, term, rate, startDate, repaymentType, loanType } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const P = parseFloat(amount);
  const annualRate = parseFloat(rate);
  const termInMonths = parseInt(term);

  const frequencies = {
    weekly: { periodsPerYear: 52, label: 'Week' },
    biweekly: { periodsPerYear: 26, label: 'Bi-Week' },
    monthly: { periodsPerYear: 12, label: 'Month' },
    yearly: { periodsPerYear: 1, label: 'Year' },
  };

  const freq = frequencies[repaymentType] || frequencies.monthly;
  const totalPeriods = Math.round((termInMonths / 12) * freq.periodsPerYear);
  const periodicRate = annualRate / 100 / freq.periodsPerYear;

  let periodicPayment = 0;

  if (loanType === 'equalTotal') {
    periodicPayment = (P * periodicRate) / (1 - Math.pow(1 + periodicRate, -totalPeriods));
  } else if (loanType === 'equalPrincipal') {
    periodicPayment = (P / totalPeriods) + (P * periodicRate);
  }

  const handleAddToCompare = () => {
    setModalVisible(true);
  };

  const saveToCompare = async () => {
    try {
      const item = {
        title: inputTitle || 'Untitled',
        amount: P.toFixed(2),
        term: termInMonths,
        rate: annualRate,
        monthly: periodicPayment.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
      };

      const stored = await AsyncStorage.getItem('compareList');
      const parsed = stored ? JSON.parse(stored) : [];

      if (parsed.length >= 3) {
        Alert.alert("Limit Reached", "You can only compare up to 3 items.");
        return;
      }

      parsed.push(item);
      await AsyncStorage.setItem('compareList', JSON.stringify(parsed));
      Alert.alert("Added!", "Your item was added to Compare List.", [
        { text: "Cancel", style: "cancel" },
        { text: "Go to Compare List", onPress: () => navigation.navigate("CompareList") },
      ]);
      setModalVisible(false);
      setInputTitle('');
    } catch (err) {
      console.log('Error saving compare item:', err);
    }
  };

  let payoffDate = 'DD/MM/YYYY';
  const parts = startDate.split('/');
  if (parts.length === 3) {
    const d = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1;
    const y = parseInt(parts[2]);
    const start = new Date(y, m, d);
    if (!isNaN(start.getTime())) {
      let newDate = new Date(start);
      switch (repaymentType) {
        case 'weekly': newDate.setDate(start.getDate() + 7 * totalPeriods); break;
        case 'biweekly': newDate.setDate(start.getDate() + 14 * totalPeriods); break;
        case 'monthly': newDate.setMonth(start.getMonth() + totalPeriods); break;
        case 'yearly': newDate.setFullYear(start.getFullYear() + totalPeriods); break;
      }
      payoffDate = newDate.toLocaleDateString('en-GB');
    }
  }

  let balance = P;
  const table = [];

  let start = null;
  if (startDate) {
    const parts = startDate.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const y = parseInt(parts[2]);
      start = new Date(y, m, d);
      if (isNaN(start.getTime())) {
        start = null; 
      }
    }
  }

  for (let i = 1; i <= totalPeriods; i++) {
    const principal = loanType === 'equalTotal'
      ? periodicPayment - (balance * periodicRate)
      : P / totalPeriods;

    const interest = balance * periodicRate;
    const payment = principal + interest;
    balance -= principal;

    let dueDate = 'Invalid Date';
    if (start) {
      const date = new Date(start);
      switch (repaymentType) {
        case 'weekly': date.setDate(date.getDate() + 7 * (i - 1)); break;
        case 'biweekly': date.setDate(date.getDate() + 14 * (i - 1)); break;
        case 'monthly': date.setMonth(date.getMonth() + (i - 1)); break;
        case 'yearly': date.setFullYear(date.getFullYear() + (i - 1)); break;
      }
      dueDate = date.toLocaleDateString('en-GB');
    }

    table.push({
      period: i,
      date: dueDate,
      payment: payment.toFixed(2),
      interest: interest.toFixed(2),
      principal: principal.toFixed(2),
      balance: balance > 0 ? balance.toFixed(2) : '0.00',
    });
  }

  const totalPayment = table.reduce((sum, row) => sum + parseFloat(row.payment), 0);
  const totalInterest = totalPayment - P;

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Amortization Table</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Text style={styles.sideMenu}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.summaryWrapper}>
          <View style={styles.summaryBlock}>
            <Text>Loan Amount</Text>
            <Text>Rp {P.toFixed(2)}</Text>

            <Text style={styles.mt10}>Interest Rate</Text>
            <Text>{annualRate} %</Text>

            <Text style={styles.mt10}>Total Payment</Text>
            <Text>Rp {totalPayment.toFixed(2)}</Text>

            <Text style={styles.mt10}>Start Date</Text>
            <Text>{startDate}</Text>
          </View>

          <View style={styles.summaryBlock}>
            <Text>Duration</Text>
            <Text>{termInMonths} Months</Text>

            <Text style={styles.mt10}>{freq.label}ly Payment</Text>
            <Text>
              {loanType === 'equalTotal'
                ? `Rp ${periodicPayment.toFixed(2)}`
                : `Rp ${table[0]?.payment || '---'}`}
            </Text>

            <Text style={styles.mt10}>Total Interest</Text>
            <Text>Rp {totalInterest.toFixed(2)}</Text>

            <Text style={styles.mt10}>Pay-off Date</Text>
            <Text>{payoffDate}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Installment Schedule</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.headerCell]}>#</Text>
              <Text style={[styles.cell, styles.headerCell]}>{freq.label}</Text>
              <Text style={[styles.cell, styles.headerCell]}>Payment</Text>
              <Text style={[styles.cell, styles.headerCell]}>Interest</Text>
              <Text style={[styles.cell, styles.headerCell]}>Principal</Text>
              <Text style={[styles.cell, styles.headerCell]}>Balance</Text>
            </View>

            {table.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cell}>{row.period}</Text>
                <Text style={styles.cell}>{row.date}</Text>
                <Text style={styles.cell}>Rp {row.payment}</Text>
                <Text style={styles.cell}>Rp {row.interest}</Text>
                <Text style={styles.cell}>Rp {row.principal}</Text>
                <Text style={styles.cell}>Rp {row.balance}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.button} onPress={handleAddToCompare}>
          <Text style={styles.buttonText}>Add To Compare List</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Drawer */}
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
            <TouchableOpacity onPress={() => { setShowMenu(false); navigation.navigate('CompareList'); }}>
              <Text style={styles.drawerItem}>Compare List</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Text style={styles.drawerClose}>✖ Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 10 }}>Enter a title for this comparison:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Option A"
              value={inputTitle}
              onChangeText={setInputTitle}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveToCompare} style={styles.modalButton}>
                <Text style={{ fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerTitle: {
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryBlock: {
    width: '45%',
    padding: 16,
  },
  mt10: { marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 10,
  },
  table: {
    minWidth: 700,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4BA3C7',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    minWidth: 100,
    fontSize: 12,
    paddingHorizontal: 6,
    color: '#333',
  },
  headerCell: {
    fontWeight: '600',
    fontSize: 13,
    color: '#fff',
  },
  button: {
    marginTop: 30,
    marginBottom: 50,
    paddingVertical: 14,
    backgroundColor: '#4BA3C7',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4BA3C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  modalButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
  },
});
