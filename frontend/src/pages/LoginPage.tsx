import React from 'react';
import Form from '../components/organisms/FormLogin';
import styled from 'styled-components';

const LoginPage: React.FC = () => {
  return (
    <StyledLoginPage>
      <Form setIsLoggedIn={(isLoggedIn: boolean) => console.log('Usuario logueado en:', isLoggedIn)} />
    </StyledLoginPage>
  );
};

const StyledLoginPage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000;
`;

export default LoginPage;
