import React from 'react';
import styled from 'styled-components';
import Layout from '../layouts/MainLayout/MainLayout';

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
          <span className="text-center text-2xl md:text-3xl 
                          text-border title-text">Comming Soon</span>
        </div>
      </EmptyDataStyles>
    </Layout>
  );
}

export default CommingSoon;
