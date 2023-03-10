import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Wrapper } from './components/Wrapper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Wrapper>
      <App />
    </Wrapper>
  </React.StrictMode>
);
