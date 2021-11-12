import React from 'react';
import styled from 'styled-components';
import Layout from '../layouts/MainLayout/MainLayout';
import ComingSoon from '../assets/images/coming-soon.png';

const EmptyDataStyles = styled.div`
  width: 100%;
  overflow: auto;
  border: double 2px transparent;
  border-radius: 30px;
  background-image: transparent;
  display: flex;
  justify-content: center;
`;

function CommingSoon() {
  return (
    <Layout>
      <EmptyDataStyles>
        <div className="text-base p-20 flex justify-center text-white">
          <div className="image">
            <img src={ComingSoon} alt="Coming Soon" className="" />
          </div>
        </div>
      </EmptyDataStyles>
    </Layout>
  );
}

export default CommingSoon;
