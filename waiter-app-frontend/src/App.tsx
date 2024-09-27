import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './components/Home';
import SignIn from './components/Signin';
import WaiterDashboard from './components/WaiterDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import ResetPasswordRequest from './components/ResetPasswordRequest';
import SetPassword from './components/SetPassword';
import { NotificationProvider } from './components/NotificationSystem';
import axios from 'axios';

axios.defaults.withCredentials = true;

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('authToken');

  if (!isAuthenticated) {
    return <Navigate to={`/signin?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return element;
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/waiter-dashboard" element={<PrivateRoute element={<WaiterDashboard />} />} />
          <Route path="/manager-dashboard" element={<PrivateRoute element={<ManagerDashboard />} />} />
          <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
          <Route path="/reset-password/:token" element={<SetPassword />} />
          <Route path="/set-password/:token" element={<SetPassword />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
};

export default App;