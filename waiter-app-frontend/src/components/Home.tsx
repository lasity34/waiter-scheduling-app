import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaUserTie } from 'react-icons/fa';

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
  gap: 2rem;
`;

const StyledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  background-color: white;
  color: #333;
  text-decoration: none;
  border: 2px solid #333;
  border-radius: 10px;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f8f8;
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Home: React.FC = () => {
  return (
    <HomeContainer>
      <Title>Waiter Scheduling App</Title>
      <OptionsContainer>
        <StyledLink to="/signin?role=waiter">
          <IconWrapper>
            <FaUser />
          </IconWrapper>
          Waiter
        </StyledLink>
        <StyledLink to="/signin?role=manager">
          <IconWrapper>
            <FaUserTie />
          </IconWrapper>
          Manager
        </StyledLink>
      </OptionsContainer>
    </HomeContainer>
  );
}

export default Home;