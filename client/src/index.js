import React from 'react';
import ReactDOM from 'react-dom/client';

import App from "./app"

import { TonConnectUIProvider } from '@tonconnect/ui-react';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./style.scss"

const CloseButton = ({ closeToast }) => (
  <button style={{marginRight: 20}} aria-label="close" onClick={closeToast} className="Vue-Toastification__close-button">×</button>
);

const root = ReactDOM.createRoot(document.getElementById('app'));

root.render(
  <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
    <App />
    <ToastContainer closeButton={CloseButton}/>
  </TonConnectUIProvider>
);
