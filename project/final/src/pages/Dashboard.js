import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import '../styles/Dashboard.css'

const Dashboard = () => {

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        
      </div>
    </div>
  );
};

export default Dashboard;