import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
  background-color: white;
  padding: 2rem;
  border: 2px solid #333;
  border-radius: 10px;
`;

const StyledInput = styled.input`
  margin-bottom: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
`;

const StyledButton = styled.button`
  padding: 0.75rem;
  font-size: 1.2rem;
  color: white;
  background-color: #333;
  border: 2px solid #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #555;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 1rem;
`;

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();
  const role = new URLSearchParams(location.search).get('role');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      console.log('Sign in successful:', response.data);
      
      // Store the user's role and any other relevant info in localStorage or a state management solution
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userName', response.data.name);

      // Redirect based on role
      navigate(response.data.role === 'waiter' ? '/waiter-dashboard' : '/manager-dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'An error occurred during sign in');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Sign in error:', error);
    }
  };

  return (
    <SignInContainer>
      <Header>{role === 'waiter' ? 'Waiter' : 'Manager'} Sign In</Header>
      <StyledForm onSubmit={handleSubmit}>
        <StyledInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <StyledInput
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <StyledButton type="submit">Sign In</StyledButton>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </StyledForm>
    </SignInContainer>
  );
}

export default SignIn;