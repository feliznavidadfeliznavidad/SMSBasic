import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MainContent } from '../components/MainContent';
import '../styles/dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = React.useState({
    totalClasses: 0,
    totalStudents: 0,
    attendance: 0,
    averageGrade: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats({
          totalClasses: 5,
          totalStudents: 150,
          attendance: 85,
          averageGrade: 7.8
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <MainContent stats={stats} />
      </div>
    </div>
  );
};

export default Dashboard;