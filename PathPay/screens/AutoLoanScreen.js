import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AutoLoanScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [rate, setRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loanType, setLoanType] = useState('equalTotal');
  const [repaymentType, setRepaymentType] = useState('monthly');
  const [results, setResults] = useState({
    payment: '', totalInterest: '', totalPayment: '', payOff: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const allFilled = amount && term && rate && startDate;
    if (!allFilled) {
      setResults({ payment: '', totalInterest: '', totalPayment: '', payOff: '' });
      return;
    }

    const P = parseFloat(amount);
    let n = parseInt(term);
    const annualRate = parseFloat(rate) / 100;

    if (isNaN(P) || isNaN(n) || isNaN(annualRate)) {
      setResults({ payment: '', totalInterest: '', totalPayment: '', payOff: '' });
      return;
    }

    let periodsPerYear = 12;
    if (repaymentType === 'biweekly') {
      periodsPerYear = 26;
      n = Math.round(n * 26 / 12);
    } else if (repaymentType === 'weekly') {
      periodsPerYear = 52;
      n = Math.round(n * 52 / 12);
    } else if (repaymentType === 'yearly') {
      periodsPerYear = 1;
      n = Math.max(1, Math.round(n / 12));
    }

    const r = annualRate / periodsPerYear;
    const payment = (P * r) / (1 - Math.pow(1 + r, -n));
    const totalPayment = payment * n;
    const totalInterest = totalPayment - P;

    let payOff = 'DD/MM/YYYY';
    const dateParts = startDate.split('/');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      const start = new Date(year, month, day);
      if (!isNaN(start.getTime())) {
        if (repaymentType === 'monthly') start.setMonth(start.getMonth() + n);
        else if (repaymentType === 'biweekly') start.setDate(start.getDate() + n * 14);
        else if (repaymentType === 'weekly') start.setDate(start.getDate() + n * 7);
        else if (repaymentType === 'yearly') start.setFullYear(start.getFullYear() + n);
        payOff = start.toLocaleDateString('en-GB');
      }
    }

    setResults({
      payment: payment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      payOff,
    });
  }, [amount, term, rate, startDate, repaymentType]);

  const saveToHistory = async () => {
    const entry = {
      type: 'Auto Loan',
      amount, term, rate,
      monthly: results.payment,
      totalInterest: results.totalInterest,
      totalPayment: results.totalPayment,
      payOff: results.payOff,
      startDate,
      timestamp: new Date().toISOString(),
    };
    try {
      const existing = await AsyncStorage.getItem('loanHistory');
      const data = existing ? JSON.parse(existing) : [];
      data.push(entry);
      await AsyncStorage.setItem('loanHistory', JSON.stringify(data));
    } catch (err) {
      console.log('Error saving history:', err);
    }
  };

  const fieldInfo = (field) => {
    const titles = {
      amount: 'Loan Amount',
      term: 'Loan Term',
      rate: 'Interest Rate',
      repaymentType: 'Repayment Type',
      date: 'Start Date',
    };

    const messages = {
      amount: 'Please enter the loan amount you want to borrow into this box.',
      term: "Please enter the loan term. A loan's term can refer to the length of time you have to repay. Please enter as months.",
      rate: 'Please enter the Interest Rate into this box. You must enter the interest rate anually (Annual Ineterest Rate / Yearly / p.a).',
      repaymentType: 'Monthly periods generally preferred for loan repayments. However, if the Banks approves you can repay your loan weekly, bi weekly, monthly, or annual installments. Please select your repayment frequency here.',
      date: 'Please pick the start date for your loan schedule.',
    };

    setModalTitle(titles[field]);
    setModalMessage(messages[field]);
    setModalVisible(true);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setStartDate(`${day}/${month}/${year}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>

      <View style={styles.header}>
        <Text style={styles.title}>Auto Loan</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Text style={styles.sideMenu}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>

        {[
          { label: 'Loan Amount', value: amount, setter: setAmount, key: 'amount', placeholder: 'Rp' },
          { label: 'Loan Term (months)', value: term, setter: setTerm, key: 'term', placeholder: 'Months' },
          { label: 'Interest Rate (%)', value: rate, setter: setRate, key: 'rate', placeholder: '%' },
        ].map(item => (
          <View key={item.key} style={styles.block}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.tooltip} onPress={() => fieldInfo(item.key)}>ⓘ</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={item.placeholder}
              value={item.value}
              onChangeText={item.setter}
              keyboardType="numeric"
            />
          </View>
        ))}

        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Loan Type</Text>
            <Text style={styles.tooltip} onPress={() => fieldInfo('loanType')}>ⓘ</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={loanType} onValueChange={setLoanType} style={styles.picker}>
              <Picker.Item label="Equal Total Payments" value="equalTotal" />
              <Picker.Item label="Equal Principal Payments" value="equalPrincipal" />
            </Picker>
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Repayment Type</Text>
            <Text style={styles.tooltip} onPress={() => fieldInfo('repaymentType')}>ⓘ</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={repaymentType} onValueChange={setRepaymentType} style={styles.picker}>
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="Biweekly" value="biweekly" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Yearly" value="yearly" />
            </Picker>
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Start Date</Text>
            <Text style={styles.tooltip} onPress={() => fieldInfo('date')}>ⓘ</Text>
          </View>
          <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
            <Text style={{ color: startDate ? '#333' : '#999' }}>{startDate || 'Select Date'}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onChangeDate}
            />
          )}
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultText}>Payment: Rp. {results.payment || '------'}</Text>
          <Text style={styles.resultText}>Total Interest: Rp. {results.totalInterest || '------'}</Text>
          <Text style={styles.resultText}>Total Payment: Rp. {results.totalPayment || '------'}</Text>
          <Text style={styles.resultText}>Pay-off Date: {results.payOff || 'DD/MM/YYYY'}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            if (!amount || !term || !rate || !startDate) {
              alert('Please fill in all fields.');
              return;
            }
            await saveToHistory();
            navigation.navigate('AmortizationTable', {
              amount, term, rate, startDate, repaymentType,
            });
          }}
        >
          <Text style={styles.buttonText}>View Amortization Table</Text>
        </TouchableOpacity>
      </ScrollView>

      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
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
    paddingHorizontal: 20 
  },
  block: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  tooltip: {
    fontSize: 16,
    color: '#4BA3C7',
    marginLeft: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  resultBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#4BA3C7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    maxHeight: '80%',
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4BA3C7',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#4BA3C7',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuContainer: {
    height: '50%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 30,
  },
  menuButton: {
    width: '100%',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#4BA3C7',
  },
});
