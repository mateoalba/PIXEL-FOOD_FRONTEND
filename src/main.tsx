import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Reemplaza esto con tu Client ID real de la consola de Google
const GOOGLE_CLIENT_ID = "1033897238561-hkfqqrhea32lqqgiag9rb25edphsgg7i.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 1. Google Provider envuelve todo */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* 2. AuthProvider para tu lógica de login (una sola vez) */}
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);