import React, { createContext, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

// Styled components for notifications
const NotificationContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'translateY(0)' : 'translateY(-20px)'};
  z-index: 1000;
`;

// Context for managing notifications
const NotificationContext = createContext({
  showNotification: (message: string) => {},
  hideNotification: () => {}
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState({ message: '', isVisible: false });

  const showNotification = (message: string) => {
    setNotification({ message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (notification.isVisible) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification.isVisible]);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <NotificationContainer isVisible={notification.isVisible}>
        {notification.message}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};