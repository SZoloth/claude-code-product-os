import React from 'react';

// Minimal test component to isolate React errors
export const MinimalTest: React.FC = () => {
  return (
    <div className="p-4 bg-blue-500 text-white">
      <h1>Minimal Test - React is working</h1>
      <p>If you see this, React basics are functional</p>
    </div>
  );
};