import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const StyledLink = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const Home: React.FC = () => {
  return (
    <HomeContainer>
      <Title>Waiter Scheduling App</Title>
      <OptionsContainer>
        <StyledLink to="/signin?role=waiter">Waiter</StyledLink>
        <StyledLink to="/signin?role=manager">Manager</StyledLink>
      </OptionsContainer>
    </HomeContainer>
  );
}

export default Home;