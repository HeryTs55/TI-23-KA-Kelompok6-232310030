import React, { useState } from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Pressable, 
  Image, 
  ScrollView
} from 'react-native';
import {
  Wallet,
  Home as HomeIcon,
  Car,
  Briefcase,
  ListOrdered,
  Clock,
  Info,
} from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.innerContainer}>

        {/* Logo */}
        <Image
          source={require('../assets/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Nama Aplikasi */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>PathPay</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Info size={22} color="#4BA3C7" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Plan Smart, Pay Smart</Text>

        {/* Card Jenis Pinjaman */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PersonalLoan')}>
          <Wallet size={24} color="#4BA3C7" style={styles.icon} />
          <Text style={styles.cardText}>Personal Loans</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Mortgage')}>
          <HomeIcon size={24} color="#4BA3C7" style={styles.icon} />
          <Text style={styles.cardText}>Mortgages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AutoLoan')}>
          <Car size={24} color="#4BA3C7" style={styles.icon} />
          <Text style={styles.cardText}>Auto Loans</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BusinessLoan')}>
          <Briefcase size={24} color="#4BA3C7" style={styles.icon} />
          <Text style={styles.cardText}>Business Loans</Text>
        </TouchableOpacity>

        {/* Card Compare List dan History */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.halfCard} onPress={() => navigation.navigate('CompareList')}>
            <ListOrdered size={22} color="#4BA3C7" style={styles.icon} />
            <Text style={styles.cardText}>Compare List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.halfCard} onPress={() => navigation.navigate('History')}>
            <Clock size={22} color="#4BA3C7" style={styles.icon} />
            <Text style={styles.cardText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Disclaimer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Disclaimer</Text>
            <Text style={styles.modalText}>
              This application is not used as a financial service, it is only a simulation tool. 
              This application does not provide personal loans or does not communicate with 3rd party 
              lenders offering loans. This app does not offer Annual Percentage Rate (APR) or fees or 
              other costs. The user must enter the interest rate and similar information. Calculations 
              are examples. These calculations may not be appropriate for your financial situation and 
              risk and return preferences.
            </Text>
            <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'linear-gradient(180deg, #d9f1f7 0%, #f9fafb 100%)',
    paddingTop: 110,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  innerContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4BA3C7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 9,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  halfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4BA3C7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111',
  },
  modalText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#4BA3C7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
