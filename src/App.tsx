import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Auth/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Main from './components/Main';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <StoreProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Main />} />
              </Route>
              
              {/* Redirect to login by default */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </StoreProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
