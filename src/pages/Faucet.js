import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connectAccount, accountActionCreators } from 'core';
import { promisify, restService } from 'utilities';
import LoadingSpinner from '../components/UI/Loader';
import toast from '../components/UI/Toast';
import * as constants from 'utilities/constants';
import MainLayout from 'layouts/MainLayout/MainLayout';

const FaucetWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  height: 100%;
  flex: 1;
  padding: 20px;
  margin-top: 50px;
  input {
    width: 100%;
    height: 42px;
  }

  .header {
    font-size: 36px;
    font-weight: 600;
    color: var(--color-text-main);
    margin-top: 50px;
    margin-bottom: 30px;
    text-align: center;

    @media only screen and (max-width: 768px) {
      font-size: 28px;
      margin-top: 0px;
    }
  }

  .menu {
    cursor: pointer;
    .menu-label {
      background-image: linear-gradient(to right, rgb(242, 194, 101), rgb(247, 180, 79));
      color: #ffffff;
      border-radius: 5px;
      padding: 1rem;
    }
    .menu-item {
      display: none;
      overflow: hidden;
      flex-direction: column;
      background-color: #ffffff;
      color: #00000070;
      width: 100%;
      top: 105%;
      left: 0;
      border-radius: 5px;
      span {
        padding: 0.5rem 1rem;
      }
      span:hover {
        background: #a4cbf7;
      }
    }
  }

  .menu:hover {

    .menu-item {
      display: flex;
    }
  }

  .bottom {
    color: var(--color-text-main);
    padding: 30px 0;

    .title {
      font-size: 24px;
      font-weight: 600;
    }

    .description {
      margin-top: 10px;
      font-size: 16px;
      font-weight: normal;
      text-align: center;

      a {
        color: #40a9ff;
      }
    }
  }

`;

function Faucet({ form, getFromFaucet }) {
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const handleMenuClick = async (data) => {
    if (address.trim() === '') {
      toast.error({
        title: `Please input Address`
      });
      return
    }
    data.address = address
    const apiRequest = await restService({
      third_party: true,
      api: 'https://cronostestapi.annex.finance/api/v1/faucet',
      method: 'POST',
      params: data
    })
    if (apiRequest.status !== 200) {
      toast.error({
        title: apiRequest.data?.message || 'Unable to Faucet, Please Try Again!'
      });
      return
    }
  };

  return (
    <MainLayout isHeader={false}>
      <div className="flex flex-col items-center text-white">
        <FaucetWrapper className="flex flex-col">
          <p className="header">Annex Cassini Faucet</p>
          <div className="flex flex-col justify-center">
            <input
              className="bg-transparent text-18 bg-white
                           mt-1 focus:outline-none font-bold px-3 text-black w-full rounded"
              value={address}
              onChange={(e) => {setAddress(e.target.value)}}
              placeholder="Input your Cassini address..."
            />
            <div className="flex justify-between mt-24">
              <div className="relative menu flex">
                <span className='menu-label'>Give Me BTC</span>
                <div className='absolute menu-item'>
                  <span onClick={() => handleMenuClick({ asset: 'btc', amountType: 'low' })}>Low</span>
                  <span onClick={() => handleMenuClick({ asset: 'btc', amountType: 'medium' })}>Medium</span>
                  <span onClick={() => handleMenuClick({ asset: 'btc', amountType: 'high' })}>High</span>
                </div>
              </div>

              <div className="relative menu flex">
                <span className='menu-label'>Give Me ETH</span>
                <div className='absolute menu-item'>
                  <span onClick={() => handleMenuClick({ asset: 'eth', amountType: 'low' })}>Low</span>
                  <span onClick={() => handleMenuClick({ asset: 'eth', amountType: 'medium' })}>Medium</span>
                  <span onClick={() => handleMenuClick({ asset: 'eth', amountType: 'high' })}>High</span>
                </div>
              </div>

              <div className="relative menu flex">
                <span className='menu-label'>Give Me USDT</span>
                <div className='absolute menu-item'>
                  <span onClick={() => handleMenuClick({ asset: 'usdt', amountType: 'low' })}>Low</span>
                  <span onClick={() => handleMenuClick({ asset: 'usdt', amountType: 'medium' })}>Medium</span>
                  <span onClick={() => handleMenuClick({ asset: 'usdt', amountType: 'high' })}>High</span>
                </div>
              </div>

              <div className="relative menu flex">
                <span className='menu-label'>Give Me ANN</span>
                <div className='absolute menu-item'>
                  <span onClick={() => handleMenuClick({ asset: 'ann', amountType: 'low' })}>Low</span>
                  <span onClick={() => handleMenuClick({ asset: 'ann', amountType: 'medium' })}>Medium</span>
                  <span onClick={() => handleMenuClick({ asset: 'ann', amountType: 'high' })}>High</span>
                </div>
              </div>

            </div>
          </div>
          <div className="flex flex-col items-center justify-center bottom mt-12">
            <p className="title">How does this work?</p>
            <p className="description">
              <a
                href={``}
                target="_blank"
                rel="noreferrer"
              >
                USDT
              </a>
              {`, `}
              <a
                href={``}
                target="_blank"
                rel="noreferrer"
              >
                BTC
              </a>
              {`, `}
              <a
                href={``}
                target="_blank"
                rel="noreferrer"
              >
                ETH
              </a>
              {`, `}
              <a
                href={``}
                target="_blank"
                rel="noreferrer"
              >
                ANN
              </a>
              {` are issued as BEP20 token.`}
            </p>
            <p className="description">
              Click to get detail about{' '}
              <a
                href="https://github.com/binance-chain/BEPs/blob/master/BEP20.md"
                target="_blank"
                rel="noreferrer"
              >
                BEP20
              </a>
            </p>
          </div>
        </FaucetWrapper>
      </div>
    </MainLayout>
  );
}

const mapDispatchToProps = dispatch => {
  const { getFromFaucet } = accountActionCreators;

  return bindActionCreators(
    {
      getFromFaucet
    },
    dispatch
  );
};

// export default compose(
//   withRouter,
//   Form.create({ name: 'faucet-form' }),
//   connectAccount(undefined, mapDispatchToProps)
// )(Faucet);


export default connectAccount(undefined, mapDispatchToProps)(Faucet);