import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="home">
      <h1>Waiter Scheduling App</h1>
      <div className="options">
        <Link to="/signin?role=waiter" className="button">Waiter</Link>
        <Link to="/signin?role=manager" className="button">Manager</Link>
      </div>
    </div>
  );
}


export default Home;