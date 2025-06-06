import React from "react";
import "./SkeletonLoading.css";
import logo from '../../components/Img/LogoLaVaca.png';

const DashboardSkeleton = ({ message = "Cargando tu dashboard..." }) => {
  return (
    <div className="dashboard-container skeleton-dashboard">
      {/* Header skeleton with logo */}
      <header className="skeleton-header">
        <div className="skeleton-header-left">
          <img src={logo} alt="LaVaca Logo" className="skeleton-logo-img" style={{width: '40px', height: 'auto'}} />
          <div className="skeleton-title"></div>
        </div>
        <div className="skeleton-header-right">
          <div className="skeleton-notification"></div>
          <div className="skeleton-user"></div>
        </div>
      </header>

      <div className="dash-layout">
        {/* Sidebar skeleton */}
        <aside className="skeleton-sidebar">
          <div className="skeleton-menu-item"></div>
          <div className="skeleton-menu-item"></div>
          <div className="skeleton-menu-item"></div>
          <div className="skeleton-menu-item"></div>
        </aside>

        {/* Main content skeleton */}
        <main className="skeleton-main-content">
          <div className="skeleton-dashboard-module">
            <div className="skeleton-section-title"></div>
            
            <div className="skeleton-card-grid">
              <div className="skeleton-card">
                <div className="skeleton-card-header"></div>
                <div className="skeleton-card-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
              </div>
              
              <div className="skeleton-card">
                <div className="skeleton-card-header"></div>
                <div className="skeleton-card-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
              </div>
              
              <div className="skeleton-card">
                <div className="skeleton-card-header"></div>
                <div className="skeleton-card-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line"></div>
                </div>
              </div>
            </div>
            
            <div className="skeleton-section-title"></div>
            <div className="skeleton-table">
              <div className="skeleton-table-row"></div>
              <div className="skeleton-table-row"></div>
              <div className="skeleton-table-row"></div>
            </div>
          </div>
          
          {/* Mensaje de carga */}
          <div className="skeleton-message">{message}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardSkeleton;