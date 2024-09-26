import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { setPassword, resetPassword } from '../api';
import { useNotification } from './NotificationSystem';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: 0 auto;
`;

const Input = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;

const SetPassword: React.FC = () => {
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      // Use setPassword for new users, resetPassword for password reset
      if (window.location.pathname.includes('reset-password')) {
        await resetPassword(token!, password);
      } else {
        await setPassword(token!, password);
      }
      showNotification('Password set successfully');
      navigate('/signin');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Set New Password</h2>
      <Input
        type="password"
        value={password}
        onChange={(e) => setPasswordState(e.target.value)}
        placeholder="New Password"
        required
      />
      <Input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm New Password"
        required
      />
      <Button type="submit">Set Password</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Form>
  );
};

export default SetPassword;