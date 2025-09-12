import React from 'react';
import { Container } from '@mantine/core';
import { Hero } from '../components/organisms/Hero';
import { Features } from '../components/organisms/Features';
import { FAQ } from '../components/organisms/FAQ';
import { SubscriptionPlansLink } from '../components/organisms/SubscriptionPlansLink';
import Layout from '../components/layout/Layout';

const LandingPage: React.FC = () => {
  return (
    <Layout>
      <Container size="xl" px="xs">
        <Hero />
        <Features />
        <SubscriptionPlansLink />
        <FAQ />
      </Container>
    </Layout>
  );
};

export default LandingPage;