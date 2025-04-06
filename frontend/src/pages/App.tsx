import React from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import '../styles/App.css';
import Button from '../components/atoms/Button';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/landingPage');
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button label="Pagina principal" onClick={goToLogin} />
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
