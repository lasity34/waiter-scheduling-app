import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const location = useLocation();
  const history = useHistory();
  const role = new URLSearchParams(location.search).get('role');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically handle authentication
    console.log('Sign in attempt:', { email, password, role });
    // Redirect based on role (for now, we'll just redirect without actual authentication)
    history.push(role === 'waiter' ? '/waiter-dashboard' : '/manager-dashboard');
  };

  return (
    <div className="sign-in">
      <h2>Sign In as {role}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignIn;