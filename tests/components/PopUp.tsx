import React, { useMemo } from 'react';

// ポップアップのProps型定義
interface PopupProps {
  visible: boolean;
  color: 'red' | 'green' | 'yellow' | 'blue' | 'gold' | 'teal' | 'purple' | 'orange' | string; 
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
    // 透過度 (Alpha) の値 (プリセット用)
    const presetOpacity = 'cc'; // 約80%の透過度

    const getColors = (colorKey: string) => {
      // 💡 修正箇所：colorKeyが16進数コード（#で始まり7文字）の場合
      if (colorKey.startsWith('#') && (colorKey.length === 7 || colorKey.length === 9)) {
        
        // 1. カスタムカラーが指定された場合、プリセットと同じ透過度を適用
        const baseColor = colorKey.substring(0, 7); // #RRGGBB 部分を抽出
        const customOpacity = 'cc'; // 💡 透過度を 'ff' (不透明) から 'cc' (80%透明) に変更
        
        // 単色のグラデーションとして処理
        return {
            start: `${baseColor}${customOpacity}`, 
            end: `${baseColor}${customOpacity}`,   
            textShadow: `0 0 10px ${baseColor}`,
        };
      }

      // プリセットカラーの処理 (透過度: cc)
      switch (colorKey) {
        case 'red':
          return {
            start: `#ef4444${presetOpacity}`, 
            end: `#b91c1c${presetOpacity}`,   
            textShadow: '0 0 10px #f87171',
          };
        case 'green':
          return {
            start: `#10b981${presetOpacity}`, 
            end: `#059669${presetOpacity}`,   
            textShadow: '0 0 10px #34d399',
          };
        case 'yellow':
          return {
            start: `#facc15${presetOpacity}`, 
            end: `#d97706${presetOpacity}`,   
            textShadow: '0 0 10px #fde047',
          };
        case 'gold':
          return {
            start: `#d97706${presetOpacity}`, 
            end: `#b45309${presetOpacity}`,   
            textShadow: '0 0 10px #fcd34d',
          };
        case 'teal':
          return {
            start: `#2dd4bf${presetOpacity}`, 
            end: `#0d9488${presetOpacity}`,   
            textShadow: '0 0 10px #5eead4',
          };
        case 'purple':
          return {
            start: `#a855f7${presetOpacity}`, 
            end: `#7c3aed${presetOpacity}`,   
            textShadow: '0 0 10px #c084fc',
          };
        case 'orange':
          return {
            start: `#f97316${presetOpacity}`, 
            end: `#ea580c${presetOpacity}`,   
            textShadow: '0 0 10px #fdba74',
          };
        case 'blue':
        default:
          return {
            start: `#3b82f6${presetOpacity}`, 
            end: `#1d4ed8${presetOpacity}`,   
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
