import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import Providers from './providers'
import Routes from './routes/index';
import './assets/styles/fontStyles.css';
import './assets/styles/utilityStyles.css';
import './assets/styles/tailwind.css';
import 'react-rangeslider/lib/index.css';

ReactDOM.render(
  <Providers>
    <Routes />
  </Providers>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
