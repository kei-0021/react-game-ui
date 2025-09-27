import '@testing-library/jest-dom'; // ← 追加
import React from 'react';

// グローバルに React を渡す（JSX が動くように）
global.React = React as any;
