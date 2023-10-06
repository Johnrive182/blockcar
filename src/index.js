import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './frontend/components/App';
import 'bootstrap/dist/css/bootstrap.css'
import reportWebVitals from './reportWebVitals';
import './frontend/styles/styles.scss';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

reportWebVitals();