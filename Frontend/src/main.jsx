import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux'
import {store} from './app/store.js'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="678496959963-8hb0i6i59fi9rn14oe7ku9ogr46pndj2.apps.googleusercontent.com">
      <Provider store={store}>
        <BrowserRouter >
          <App />
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)