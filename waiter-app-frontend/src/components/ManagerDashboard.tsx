import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { logout } from "../api";
import ShiftManagement from "./ShiftManagement";
import UserManagement from "./UserManagement";
import { useNotification } from "./NotificationSystem"

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  max-width: 100%;
  overflow-x: hidden;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Header = styled.h2`
  color: #333;
  margin-bottom: 10px;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  background-color: ${(props) => (props.active ? "#007bff" : "#f8f9fa")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background-color: ${(props) => (props.active ? "#0056b3" : "#e2e6ea")};
  }
`;

const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"shifts" | "users">("shifts");
  const navigate = useNavigate();
  const { showNotification } = useNotification()

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('authToken');
      navigate('/', { state: { message: 'You have been successfully logged out.' } });
    } catch (error: any) {
      console.error('Error logging out:', error);
      showNotification(error.response?.data?.message || 'Failed to log out');
    }
  };

  return (
    <DashboardContainer>
      <HeaderContainer>
        <Header>Manager Dashboard</Header>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </HeaderContainer>
      <TabContainer>
        <Tab
          active={activeTab === "shifts"}
          onClick={() => setActiveTab("shifts")}
        >
          Shifts
        </Tab>
        <Tab
          active={activeTab === "users"}
          onClick={() => setActiveTab("users")}
        >
          Users
        </Tab>
      </TabContainer>
      {activeTab === "shifts" ? <ShiftManagement /> : <UserManagement />}
    </DashboardContainer>
  );
};

export default ManagerDashboard;