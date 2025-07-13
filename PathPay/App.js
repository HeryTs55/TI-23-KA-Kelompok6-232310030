import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PersonalLoanScreen from './screens/PersonalLoanScreen';
import AmortizationTableScreen from './screens/AmortizationTableScreen';
import MortgageScreen from './screens/MortgageScreen';
import BusinessLoanScreen from './screens/BusinessLoanScreen';
import AutoLoanScreen from './screens/AutoLoanScreen';
import HistoryScreen from './screens/HistoryScreen';
import CompareListScreen from './screens/CompareListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PersonalLoan" component={PersonalLoanScreen} />
        <Stack.Screen name="AmortizationTable" component={AmortizationTableScreen} />
        <Stack.Screen name="Mortgage" component={MortgageScreen} />
        <Stack.Screen name="BusinessLoan" component={BusinessLoanScreen} />
        <Stack.Screen name="AutoLoan" component={AutoLoanScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="CompareList" component={CompareListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
