// tests/components/MyCustomCellRenderer.tsx
import * as React from 'react';
import { CellData } from 'react-game-ui';

export const MyCustomCellRenderer = (celldata: CellData, row: number, col: number) => {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#e0e0e0',
    fontWeight: 'bold',
    fontSize: '26px',
    textAlign: 'center',
    lineHeight: '1.2',
  };

  if (celldata.shapeType === 'circle') {
    return (
      <div style={{ ...baseStyle, borderRadius: '50%', backgroundColor: 'transparent', color: 'white' }}>
        {celldata.content}
      </div>
    );
  }

  if (celldata.shapeType === 'custom') {
    return (
      <div
        style={{
          ...baseStyle,
          clipPath: celldata.customClip as string,
          backgroundColor: celldata.backgroundColor === '#ff8a8a' ? '#ff3b3b' : celldata.backgroundColor,
          color: 'white',
        }}
      >
        {celldata.content}
      </div>
    );
  }

  return <div style={{ ...baseStyle, border: '1px solid rgba(255,255,255,0.1)' }}>{celldata.content}</div>;
};
