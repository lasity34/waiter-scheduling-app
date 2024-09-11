import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import SignIn from './components/SignIn';
import WaiterDashboard from './components/WaiterDashboard';
import ManagerDashboard from './components/ManagerDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/signin" component={SignIn} />
          <Route path="/waiter-dashboard" component={WaiterDashboard} />
          <Route path="/manager-dashboard" component={ManagerDashboard} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;