import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import React from 'react';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
    <App />
);
