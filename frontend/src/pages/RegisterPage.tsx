import React from 'react';
import RegisterForm from '../components/organisms/FormRegister';
import Layout from '../components/layout/Layout';

const RegisterPage: React.FC = () => {
  return (
    <Layout>
      <RegisterForm />
    </Layout>
  );
};

export default RegisterPage;