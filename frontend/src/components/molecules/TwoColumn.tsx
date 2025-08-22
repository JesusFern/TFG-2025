import React from 'react';

type TwoColumnProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  gap?: number;
};

const TwoColumn: React.FC<TwoColumnProps> = ({ left, right, gap = 24 }) => {
  return (
    <div style={{ display: 'flex', gap, width: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>{left}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>{right}</div>
    </div>
  );
};

export default TwoColumn;


