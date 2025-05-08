// Firebase configuration and utility functions
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  Firestore 
} from 'firebase/firestore';
import { Sale, Expense } from './types';

// Check if all required Firebase environment variables are defined
const checkEnvVariables = () => {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];
  
  console.log('Checking environment variables...');
  requiredVars.forEach(varName => {
    console.log(`${varName}: ${process.env[varName] ? 'defined' : 'undefined'}`);
  });
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
  }
};

// Attempt to check environment variables
try {
  checkEnvVariables();
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

console.log('Firebase config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '[DEFINED]' : '[UNDEFINED]',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '[DEFINED]' : '[UNDEFINED]',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? '[DEFINED]' : '[UNDEFINED]',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? '[DEFINED]' : '[UNDEFINED]',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? '[DEFINED]' : '[UNDEFINED]',
  appId: process.env.REACT_APP_FIREBASE_APP_ID ? '[DEFINED]' : '[UNDEFINED]'
});

// Initialize Firebase and Firestore
let app: FirebaseApp;
let db: Firestore;

try {
  console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
  db = getFirestore(app);
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { db };

// Authentication functions
export const verifyCredentials = async (loginID: string, password: string) => {
  try {
    console.log('Verifying credentials for:', loginID);
    const credentialsCollection = collection(db, 'credentials');
    const q = query(
      credentialsCollection,
      where('LoginID', '==', loginID)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('User not found');
      return { success: false, message: 'Invalid login ID or password' };
    }
    
    // Check the password against the stored one
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    if (userData.Password === password) {
      console.log('Login successful');
      return { success: true, user: { id: userDoc.id, loginID: userData.LoginID } };
    } else {
      console.log('Incorrect password');
      return { success: false, message: 'Invalid login ID or password' };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Utility function to get start and end of day for a given date
export const getStartAndEndOfDay = (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    startOfDay: Timestamp.fromDate(startOfDay),
    endOfDay: Timestamp.fromDate(endOfDay)
  };
};

// Type for sales document (without id and date)
type SaleInput = Omit<Sale, 'id' | 'date'>;

// Add a new sale to Firestore
export const addSale = async ({ items, mrp, discount, totalAmount, modeOfPayment }: SaleInput) => {
  try {
    console.log('Adding sale with data:', { items, mrp, discount, totalAmount, modeOfPayment });
    
    // Create a sale object with data validation
    const saleData = {
      items: items || '',
      mrp: Number(mrp) || 0,
      discount: Number(discount || 0),
      totalAmount: Number(totalAmount) || 0,
      modeOfPayment: modeOfPayment || 'Cash',
      date: serverTimestamp()
    };
    
    console.log('Prepared sale data:', saleData);
    
    // Reference to the sales collection
    const salesCollection = collection(db, 'sales');
    console.log('Got reference to sales collection');
    
    // Add the document
    const docRef = await addDoc(salesCollection, saleData);
    
    console.log('Sale added successfully with ID:', docRef.id);
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error adding sale: ', error);
    throw error;
  }
};

// Type for expense document (without id and date)
type ExpenseInput = Omit<Expense, 'id' | 'date'>;

// Add a new expense to Firestore
export const addExpense = async ({ name, amount, modeOfPayment }: ExpenseInput) => {
  try {
    console.log('Adding expense with data:', { name, amount, modeOfPayment });
    
    // Create an expense object with data validation
    const expenseData = {
      name: name || '',
      amount: Number(amount) || 0,
      modeOfPayment: modeOfPayment || 'Cash',
      date: serverTimestamp()
    };
    
    console.log('Prepared expense data:', expenseData);
    
    // Reference to the expenses collection
    const expensesCollection = collection(db, 'expenses');
    console.log('Got reference to expenses collection');
    
    // Add the document
    const docRef = await addDoc(expensesCollection, expenseData);
    
    console.log('Expense added successfully with ID:', docRef.id);
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error adding expense: ', error);
    throw error;
  }
};

// Get records from a collection within a date range (one day by default)
export const getRecords = async (collectionName: 'sales' | 'expenses', date: Date = new Date()) => {
  try {
    console.log(`Fetching ${collectionName} records for date:`, date);
    const { startOfDay, endOfDay } = getStartAndEndOfDay(date);
    
    const q = query(
      collection(db, collectionName),
      where('date', '>=', startOfDay),
      where('date', '<=', endOfDay)
    );
    
    const querySnapshot = await getDocs(q);
    const records: any[] = [];
    
    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to JavaScript Date
        date: doc.data().date ? doc.data().date.toDate() : new Date()
      });
    });
    
    console.log(`Retrieved ${records.length} ${collectionName} records`);
    return records;
  } catch (error) {
    console.error(`Error getting ${collectionName}: `, error);
    throw error;
  }
};

// Delete a record from a collection
export const deleteRecord = async (collectionName: 'sales' | 'expenses', docId: string) => {
  try {
    console.log(`Deleting ${collectionName} record with ID:`, docId);
    await deleteDoc(doc(db, collectionName, docId));
    console.log(`Deleted ${collectionName} record with ID:`, docId);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ${collectionName} record: `, error);
    throw error;
  }
};

// Update a record in a collection
export const updateRecord = async (collectionName: 'sales' | 'expenses', docId: string, data: any) => {
  try {
    console.log(`Updating ${collectionName} record with ID:`, docId, 'Data:', data);
    await updateDoc(doc(db, collectionName, docId), data);
    console.log(`Updated ${collectionName} record with ID:`, docId);
    return { success: true };
  } catch (error) {
    console.error(`Error updating ${collectionName} record: `, error);
    throw error;
  }
}; 