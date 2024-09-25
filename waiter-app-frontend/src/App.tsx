import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SignIn from './components/Signin';
import WaiterDashboard from './components/WaiterDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import axios from 'axios';
import { NotificationProvider } from './components/NotificationSystem';

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
        </Routes>
      </div>
    </NotificationProvider>
  );
};

export default App;