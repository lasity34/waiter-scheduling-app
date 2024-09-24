import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { login } from '../api';
import { FaArrowLeft } from 'react-icons/fa';
import axios from "axios";


axios.defaults.withCredentials = true;

const SignInContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  padding: 1rem;
  box-sizing: border-box;
`;

const Header = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 350px) {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  background-color: white;
  padding: 2rem;
  border: 2px solid #333;
  border-radius: 10px;

  @media (max-width: 480px) {
    padding: 1.5rem;
    width: 80%;
  }

  @media (max-width: 350px) {
    padding: 1rem;
    border-width: 1px;
  }
`;

const StyledInput = styled.input`
  margin-bottom: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #333;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 350px) {
    padding: 0.5rem;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
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

  @media (max-width: 480px) {
    font-size: 1rem;
  }

  @media (max-width: 350px) {
    padding: 0.5rem;
    font-size: 0.9rem;
    border-width: 1px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;

  @media (max-width: 350px) {
    font-size: 0.8rem;
    margin-top: 0.75rem;
  }
`;

const BackToHomeLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  margin-top: 1rem;
  transition: color 0.3s ease;

  &:hover {
    color: #555;
  }

  svg {
    margin-right: 0.5rem;
  }

  @media (max-width: 350px) {
    font-size: 0.9rem;
  }
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
      const response = await login(email, password);
      console.log('Login response:', response);

      if (response.data && response.data.role) {
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userName', response.data.name);
        localStorage.setItem('userId', response.data.id.toString());

        navigate(response.data.role === 'waiter' ? '/waiter-dashboard' : '/manager-dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.response) {
        setError(error.response.data?.message || 'An error occurred during sign in');
      } else if (error.request) {
        setError('No response received from server');
      } else {
        setError('An unexpected error occurred');
      }
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
      <BackToHomeLink to="/">
        <FaArrowLeft /> Back to Home
      </BackToHomeLink>
    </SignInContainer>
  );
}

export default SignIn;