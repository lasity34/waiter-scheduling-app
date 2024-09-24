import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SignIn from './components/Signin';
import WaiterDashboard from './components/WaiterDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import axios from 'axios';

axios.defaults.withCredentials = true;
const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/waiter-dashboard" element={<WaiterDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
      </Routes>
    </div>
  );
};

export default App;