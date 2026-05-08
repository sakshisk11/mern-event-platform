import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import VerifyTicket from './pages/VerifyTicket';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        
        {/* We moved the navigation logic into its own component! */}
        <Navbar />
        
        {/* Route Configuration */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          {/* /verify-ticket — admin scanner page. Also handles ?ref=ID when opened from QR link */}
          <Route path="/verify-ticket" element={<VerifyTicket />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;
