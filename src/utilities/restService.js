// @flow

import { set, isEmpty } from 'lodash';

export async function restService({
  api,
  method,
  params,
  contentType = 'json',
  token = null,
  chainId,
  third_party = false,
}) {
  const headers = {};
  let path;

  if (chainId === 97) {
    path = `${process.env.REACT_APP_BSC_TESTNET_API}${api}`;
  } else if (chainId === 56) {
    path = `${process.env.REACT_APP_BSC_MAINNET_API}${api}`;
  } else if (chainId === 338) {
    path = `${process.env.REACT_APP_CRO_TESTNET_API}${api}`;
  } else {
    path = `${process.env.REACT_APP_CRO_MAINNET_API}${api}`;
  }

  if (third_party) {
    path = api;
  }

  const formData = new FormData();
  if (contentType === 'multi-form') {
    Object.keys(params).forEach(key => {
      if (params[key] !== null && key !== 'token') {
        formData.append(key, params[key]);
      }
    });
  } else {
    set(headers, 'Accept', 'application/json');
    set(headers, 'Content-Type', 'application/json');
  }

  if (token) {
    set(headers, 'Authorization', `Bearer ${token}`);
  }
  const reqBody = {
    method,
    headers
  };
  if (contentType === 'multi-form') {
    reqBody.body = formData;
  } else if (!isEmpty(params)) {
    reqBody.body = JSON.stringify(params);
  } else if (Array.isArray(params)) {
    reqBody.body = JSON.stringify([]);
  }

  return fetch(path, reqBody)
    .then(response => {
      return response.text().then(text => {
        return text
          ? { status: response.status, data: JSON.parse(text) }
          : { status: response.status };
      });
    })
    .catch(error => {
      return {
        result: 'error',
        message: error
      };
    });
}
