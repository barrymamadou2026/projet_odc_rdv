import React from 'react';
import Sidebar from './Sidebar';

interface Props {
  active: string;
  children: React.ReactNode;
}

const DashboardShell: React.FC<Props> = ({ active, children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active={active} />
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8">{children}</main>
    </div>
  );
};

export default DashboardShell;
