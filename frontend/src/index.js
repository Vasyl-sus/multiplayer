import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {SettingProvider} from "./providers/SettingProvider";
import {AudioProvider} from "./providers/AudioProvider";

ReactDOM.render(
  // <React.StrictMode>
  <AudioProvider>
    <SettingProvider>
      <App />
    </SettingProvider>
  </AudioProvider>,
  // </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
