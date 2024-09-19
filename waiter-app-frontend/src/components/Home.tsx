import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaUserTie } from 'react-icons/fa';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  padding: 2rem 1rem;
  background-color: #f0f0f0;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
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

  @media (max-width: 480px) {
    width: 140px;
    height: 140px;
    font-size: 1rem;
  }

  @media (max-width: 360px) {
    width: 120px;
    height: 120px;
    font-size: 0.9rem;
  }
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    font-size: 2.5rem;
  }

  @media (max-width: 360px) {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 1rem 0;
  width: 100%;
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
      <Footer></Footer>
    </HomeContainer>
  );
}

export default Home;