import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SignIn from './components/Signin';
import WaiterDashboard from './components/WaiterDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import ResetPasswordRequest from './components/ResetPasswordRequest';
import SetPassword from './components/SetPassword';
import { NotificationProvider } from './components/NotificationSystem';
import axios from 'axios';

axios.defaults.withCredentials = true;

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/waiter-dashboard" element={<WaiterDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
          <Route path="/reset-password/:token" element={<SetPassword />} />
          <Route path="/set-password/:token" element={<SetPassword />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
};

export default App;