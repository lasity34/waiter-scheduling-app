import React, { useState } from 'react';
import styled from 'styled-components';
import { resetPasswordRequest } from '../api';
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

const ResetPasswordRequest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPasswordRequest(email);
      showNotification('If an account with that email exists, we have sent a password reset link.');
      setError('');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <Button type="submit">Request Password Reset</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Form>
  );
};

export default ResetPasswordRequest;