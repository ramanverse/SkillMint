import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-mint-light/50">
      <Sidebar />
      <main className="flex-1 lg:ml-60">
        <div className="pt-16 lg:pt-0 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
