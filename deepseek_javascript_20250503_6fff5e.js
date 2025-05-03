// App.js
import React from 'react';
import { ThemeProvider } from './src/styles/themes';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/utils/i18n';
import AppNavigator from './src/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <AppNavigator />
      </I18nextProvider>
    </ThemeProvider>
  );
}

// AppNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import GroceryListScreen from './src/screens/GroceryListScreen';
import BudgetTrackerScreen from './src/screens/BudgetTrackerScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CustomDrawerContent from './src/components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator 
        initialRouteName="GroceryList"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
          headerTintColor: '#FFFFFF',
        }}
      >
        <Drawer.Screen name="GroceryList" component={GroceryListScreen} />
        <Drawer.Screen name="BudgetTracker" component={BudgetTrackerScreen} />
        <Drawer.Screen name="History" component={HistoryScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// GroceryListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../styles/themes';
import GroceryItem from '../components/GroceryItem';
import AddItemModal from '../components/AddItemModal';
import { loadGroceryItems, saveGroceryItems } from '../utils/storage';

export default function GroceryListScreen() {
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => { loadItems() }, []);
  const loadItems = async () => { const savedItems = await loadGroceryItems(); if (savedItems) setItems(savedItems); };

  const addItem = async (newItem) => { const updatedItems = [...items, newItem]; setItems(updatedItems); await saveGroceryItems(updatedItems); };
  const toggleBought = async (id) => { const updatedItems = items.map(item => item.id === id ? { ...item, bought: !item.bought } : item); setItems(updatedItems); await saveGroceryItems(updatedItems); };
  const clearCompleted = async () => { const updatedItems = items.filter(item => !item.bought); setItems(updatedItems); await saveGroceryItems(updatedItems); };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <FlatList data={items} keyExtractor={(item) => item.id} renderItem={({ item }) => <GroceryItem item={item} onToggle={toggleBought} />} />
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <AddItemModal visible={modalVisible} onClose={() => setModalVisible(false)} onAdd={addItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addButton: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  addButtonText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
});

// BudgetTrackerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../styles/themes';
import ExpenseItem from '../components/ExpenseItem';
import AddTransactionModal from '../components/AddTransactionModal';
import { loadTransactions, saveTransactions } from '../utils/storage';

export default function BudgetTrackerScreen() {
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => { loadData() }, []);
  const loadData = async () => { const savedTransactions = await loadTransactions(); if (savedTransactions) setTransactions(savedTransactions); };

  const addTransaction = async (newTransaction) => { const updatedTransactions = [...transactions, newTransaction]; setTransactions(updatedTransactions); await saveTransactions(updatedTransactions); };
  const deleteTransaction = async (id) => { const updatedTransactions = transactions.filter(t => t.id !== id); setTransactions(updatedTransactions); await saveTransactions(updatedTransactions); };
  const calculateBalance = () => transactions.reduce((total, t) => t.type === 'income' ? total + t.amount : total - t.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceText, { color: theme.text }]}>Current Balance: ${calculateBalance().toFixed(2)}</Text>
      </View>
      <FlatList data={transactions} keyExtractor={(item) => item.id} renderItem={({ item }) => <ExpenseItem item={item} onDelete={deleteTransaction} />} />
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <AddTransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} onAdd={addTransaction} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  balanceContainer: { padding: 16, marginBottom: 16, borderRadius: 8, alignItems: 'center' },
  balanceText: { fontSize: 18, fontWeight: 'bold' },
  addButton: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  addButtonText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
});

// themes.js
import React, { createContext, useContext, useState } from 'react';

const lightTheme = { mode: 'light', backgroundColor: '#FFFFFF', secondaryBackground: '#F5F5F5', text: '#333333', secondaryText: '#666666', primary: '#6C63FF', secondary: '#FF6584', accent: '#4D8AF0', cardBackground: '#FFFFFF', border: '#E0E0E0' };
const darkTheme = { mode: 'dark', backgroundColor: '#121212', secondaryBackground: '#1E1E1E', text: '#FFFFFF', secondaryText: '#B0B0B0', primary: '#BB86FC', secondary: '#03DAC6', accent: '#3700B3', cardBackground: '#1E1E1E', border: '#333333' };
const purpleGradientTheme = { ...darkTheme, primary: '#9C27B0', secondary: '#673AB7' };
const blueGradientTheme = { ...darkTheme, primary: '#2196F3', secondary: '#03A9F4' };
const greenGradientTheme = { ...darkTheme, primary: '#4CAF50', secondary: '#8BC34A' };

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(darkTheme);
  const [themeName, setThemeName] = useState('dark');

  const switchTheme = (selectedTheme) => {
    switch (selectedTheme) {
      case 'light': setTheme(lightTheme); setThemeName('light'); break;
      case 'dark': setTheme(darkTheme); setThemeName('dark'); break;
      case 'purple': setTheme(purpleGradientTheme); setThemeName('purple'); break;
      case 'blue': setTheme(blueGradientTheme); setThemeName('blue'); break;
      case 'green': setTheme(greenGradientTheme); setThemeName('green'); break;
      default: setTheme(darkTheme); setThemeName('dark');
    }
  };

  return <ThemeContext.Provider value={{ theme, switchTheme, themeName }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const GROCERY_ITEMS_KEY = 'grocery_items';
export const loadGroceryItems = async () => { try { const items = await AsyncStorage.getItem(GROCERY_ITEMS_KEY); return items ? JSON.parse(items) : []; } catch (error) { console.error('Error loading grocery items:', error); return []; } };
export const saveGroceryItems = async (items) => { try { await AsyncStorage.setItem(GROCERY_ITEMS_KEY, JSON.stringify(items)); } catch (error) { console.error('Error saving grocery items:', error); } };

const TRANSACTIONS_KEY = 'transactions';
export const loadTransactions = async () => { try { const transactions = await AsyncStorage.getItem(TRANSACTIONS_KEY); return transactions ? JSON.parse(transactions) : []; } catch (error) { console.error('Error loading transactions:', error); return []; } };
export const saveTransactions = async (transactions) => { try { await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions)); } catch (error) { console.error('Error saving transactions:', error); } };

const SETTINGS_KEY = 'app_settings';
export const loadSettings = async () => { try { const settings = await AsyncStorage.getItem(SETTINGS_KEY); return settings ? JSON.parse(settings) : { theme: 'dark', language: 'en' }; } catch (error) { console.error('Error loading settings:', error); return { theme: 'dark', language: 'en' }; } };
export const saveSettings = async (settings) => { try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (error) { console.error('Error saving settings:', error); } };

// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: { translation: { groceryList: 'Grocery List', budgetTracker: 'Budget Tracker', history: 'History', settings: 'Settings', addItem: 'Add Item', itemName: 'Item Name', category: 'Category', estimatedPrice: 'Estimated Price', cancel: 'Cancel', save: 'Save', clearCompleted: 'Clear Completed' }},
  hi: { translation: { groceryList: 'किराने की सूची', budgetTracker: 'बजट ट्रैकर', history: 'इतिहास', settings: 'सेटिंग्स', addItem: 'आइटम जोड़ें', itemName: 'वस्तु का नाम', category: 'श्रेणी', estimatedPrice: 'अनुमानित मूल्य', cancel: 'रद्द करना', save: 'सहेजें', clearCompleted: 'पूर्ण हटाएं' }},
  ur: { translation: { groceryList: 'گروسری کی فہرست', budgetTracker: 'بجٹ ٹریکر', history: 'تاریخ', settings: 'ترتیبات', addItem: 'شے شامل کریں', itemName: 'شے کا نام', category: 'قسم', estimatedPrice: 'اندازہ شدہ قیمت', cancel: 'منسوخ کریں', save: 'محفوظ کریں', clearCompleted: 'مکمل صاف کریں' }}
};

i18n.use(initReactI18next).init({ resources, lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false } });

const loadLanguage = async () => {
  try {
    const settings = await AsyncStorage.getItem('app_settings');
    if (settings) { const { language } = JSON.parse(settings); i18n.changeLanguage(language); }
  } catch (error) { console.error('Error loading language:', error); }
};

loadLanguage();

export default i18n;

// SettingsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../styles/themes';
import { loadSettings, saveSettings } from '../utils/storage';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { theme, switchTheme, themeName } = useTheme();
  const [settings, setSettings] = useState({ theme: 'dark', language: 'en' });
  const { t, i18n } = useTranslation();

  useEffect(() => { loadSavedSettings() }, []);
  const loadSavedSettings = async () => { const savedSettings = await loadSettings(); if (savedSettings) { setSettings(savedSettings); switchTheme(savedSettings.theme); i18n.changeLanguage(savedSettings.language); } };

  const handleThemeChange = async (selectedTheme) => { switchTheme(selectedTheme); const newSettings = { ...settings, theme: selectedTheme }; setSettings(newSettings); await saveSettings(newSettings); };
  const handleLanguageChange = async (language) => { i18n.changeLanguage(language); const newSettings = { ...settings, language }; setSettings(newSettings); await saveSettings(newSettings); };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.sectionHeader, { color: theme.text }]}>{t('appearance')}</Text>
      <View style={styles.optionContainer}>
        <Text style={[styles.optionText, { color: theme.text }]}>{t('darkMode')}</Text>
        <Switch value={themeName !== 'light'} onValueChange={(value) => handleThemeChange(value ? 'dark' : 'light')} thumbColor={theme.primary} trackColor={{ false: '#767577', true: theme.primary }} />
      </View>
      <Text style={[styles.sectionHeader, { color: theme.text }]}>{t('themeColor')}</Text>
      <View style={styles.themeOptions}>
        <TouchableOpacity style={[styles.themeOption, { backgroundColor: '#BB86FC' }, themeName === 'purple' && styles.selectedTheme ]} onPress={() => handleThemeChange('purple')} />
        <TouchableOpacity style={[styles.themeOption, { backgroundColor: '#2196F3' }, themeName === 'blue' && styles.selectedTheme ]} onPress={() => handleThemeChange('blue')} />
        <TouchableOpacity style={[styles.themeOption, { backgroundColor: '#4CAF50' }, themeName === 'green' && styles.selectedTheme ]} onPress={() => handleThemeChange('green')} />
      </View>
      <Text style={[styles.sectionHeader, { color: theme.text }]}>{t('language')}</Text>
      <View style={styles.languageOptions}>
        <TouchableOpacity style={[styles.languageOption, settings.language === 'en' && { backgroundColor: theme.primary }]} onPress={() => handleLanguageChange('en')}><Text style={styles.languageText}>English</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.languageOption, settings.language === 'hi' && { backgroundColor: theme.primary }]} onPress={() => handleLanguageChange('hi')}><Text style={styles.languageText}>हिंदी</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.languageOption, settings.language === 'ur' && { backgroundColor: theme.primary }]} onPress={() => handleLanguageChange('ur')}><Text style={styles.languageText}>اردو</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  optionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  optionText: { fontSize: 16 },
  themeOptions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15 },
  themeOption: { width: 50, height: 50, borderRadius: 25 },
  selectedTheme: { borderWidth: 3, borderColor: '#FFFFFF' },
  languageOptions: { marginVertical: 10 },
  languageOption: { padding: 15, borderRadius: 8, marginVertical: 5 },
  languageText: { fontSize: 16, color: '#FFFFFF' },
});

// GroceryItem.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../styles/themes';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function GroceryItem({ item, onToggle }) {
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(1));
  const [strikeThroughWidth] = useState(new Animated.Value(0));

  const handleToggle = () => {
    if (item.bought) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(strikeThroughWidth, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0.6, duration: 300, useNativeDriver: true }),
        Animated.timing(strikeThroughWidth, { toValue: 1, duration: 300, useNativeDriver: false }),
      ]).start();
    }
    onToggle(item.id);
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.cardBackground, opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={handleToggle}>
        <View style={[styles.checkbox, item.bought && { backgroundColor: theme.primary }]}>
          {item.bought && <Icon name="check" size={16} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>
      <View style={styles.details}>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Animated.View style={[styles.strikeThrough, { width: strikeThroughWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), backgroundColor: theme.text }]} />
        </View>
        <Text style={[styles.category, { color: theme.secondary }]}>{item.category}</Text>
      </View>
      <Text style={[styles.price, { color: theme.text }]}>${item.price.toFixed(2)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 8, elevation: 2 },
  checkboxContainer: { marginRight: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CCCCCC', alignItems: 'center', justifyContent: 'center' },
  details: { flex: 1 },
  textContainer: { position: 'relative' },
  name: { fontSize: 16, fontWeight: '500' },
  strikeThrough: { position: 'absolute', height: 1, top: '50%' },
  category: { fontSize: 14, marginTop: 4 },
  price: { fontSize: 16, fontWeight: 'bold' },
});

// AddItemModal.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../styles/themes';
import { useTranslation } from 'react-i18next';

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Bakery', 'Canned Goods', 'Frozen', 'Other'];

export default function AddItemModal({ visible, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleAdd = () => {
    if (name.trim() && category && price) {
      onAdd({ id: Date.now().toString(), name: name.trim(), category, price: parseFloat(price), bought: false });
      setName(''); setCategory(''); setPrice(''); onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{t('addItem')}</Text>
          <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} placeholder={t('itemName')} placeholderTextColor={theme.secondaryText} value={name} onChangeText={setName} />
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat} style={[styles.categoryButton, category === cat && { backgroundColor: theme.primary }]} onPress={() => setCategory(cat)}>
                <Text style={[styles.categoryText, category === cat && { color: '#FFFFFF' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={[styles.input, { color: theme.text, borderColor: theme.border }]} placeholder={t('estimatedPrice')} placeholderTextColor={theme.secondaryText} keyboardType="numeric" value={price} onChangeText={setPrice} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}><Text style={styles.buttonText}>{t('cancel')}</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleAdd}><Text style={styles.buttonText}>{t('save')}</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { width: '90%', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 50, borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  categoryButton: { padding: 10, borderRadius: 20, borderWidth: 1, borderColor: '#CCCCCC', marginBottom: 10 },
  categoryText: { fontSize: 14 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#CCCCCC' },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold' },
});