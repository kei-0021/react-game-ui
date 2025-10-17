import React, { useMemo } from 'react';

// ポップアップのProps型定義
interface PopupProps {
  visible: boolean;
  color: 'red' | 'green' | 'yellow' | 'blue' | string;
  children: React.ReactNode;
}

/**
 * 中央に大きく、半透明のグラデーションを適用したポップアップUI。
 * @param {PopupProps} props - visible, color, children
 * @returns {JSX.Element} ポップアップコンポーネント
 */
export default function Popup({ visible, color, children }: PopupProps) {
  // ポップアップUIのスタイルをuseMemoで計算
  const popupContainerStyle: React.CSSProperties = useMemo(() => {
    // 透過度 (Alpha) の値
    const baseOpacity = 'cc'; // 204/255 -> 約80%の透過度

    const getColors = (colorKey: string) => {
      switch (colorKey) {
        case 'red':
          return {
            start: `#ef4444${baseOpacity}`, // Red 500 (半透明)
            end: `#b91c1c${baseOpacity}`,   // Red 700 (半透明)
            textShadow: '0 0 10px #f87171',
          };
        case 'green':
          return {
            start: `#10b981${baseOpacity}`, // Green 500
            end: `#059669${baseOpacity}`,   // Green 700
            textShadow: '0 0 10px #34d399',
          };
        case 'yellow':
          return {
            start: `#facc15${baseOpacity}`, // Yellow 400
            end: `#d97706${baseOpacity}`,   // Amber 700
            textShadow: '0 0 10px #fde047',
          };
        case 'blue':
        default:
          return {
            start: `#3b82f6${baseOpacity}`, // Blue 500
            end: `#1d4ed8${baseOpacity}`,   // Blue 700
            textShadow: '0 0 10px #60a5fa',
          };
      }
    };

    const colors = getColors(color);

    return {
      position: 'fixed',
      top: '50%', // 垂直方向の中央に配置
      left: '50%',
      transform: 'translate(-50%, -50%)', // 中央揃え
      zIndex: 1001,
      minWidth: '400px', // 最小幅を設定
      padding: '50px 80px', // パディングを大きくしてサイズを拡大
      borderRadius: '16px', // 角をさらに丸く
      boxShadow: `0 0 30px ${colors.start.substring(0, 7)}, 0 8px 20px rgba(0, 0, 0, 0.7)`, // ネオンのような光沢を表現
      color: 'white',
      fontSize: '2.2em', // 文字サイズを大きく
      fontWeight: 'bold',
      textAlign: 'center',
      opacity: visible ? 1 : 0, // visible propで透過度を制御
      pointerEvents: visible ? 'auto' : 'none', // 非表示時はクリック不可に
      transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
      
      // グラデーション背景
      background: `linear-gradient(135deg, ${colors.start} 0%, ${colors.end} 100%)`,
      border: `2px solid ${colors.start.substring(0, 7)}`, // 薄い枠線を追加
      
      // テキストスタイル
      textShadow: colors.textShadow,
    };
  }, [visible, color]); // 依存配列にvisibleとcolorを指定

  // visibleがfalseの場合でもDOMをレンダリングし続けることで、
  // opacityトランジションを有効にします。
  
  return (
    <div style={popupContainerStyle}>
      {children}
    </div>
  );
}