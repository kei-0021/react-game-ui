// src/components/Token.tsx
import { TokenData } from '@/types/token.js';
import type { DragEvent } from 'react';
import React from 'react';
import tokenStyles from './Token.module.css';

const TokenDisplayContent = React.memo(({ token, isFilled }: { token: TokenData; isFilled: boolean }) => {
  // SVGかどうかを判定（簡易的な判定）
  const isSvg = token.image?.toLowerCase().endsWith('.svg');

  // 画像がない場合
  if (!token.image) {
    return (
      <div
        className={tokenStyles.contentWrapper}
        style={{ backgroundColor: token.color || '#4f4848ff', borderRadius: '50%' }}
      >
        <div className={tokenStyles.textWrapper}>
          <strong className={tokenStyles.text}>{token.name}</strong>
        </div>
      </div>
    );
  }

  // ビルド時の最適化回避用
  const MASK_IMAGE_PROP = ['mask', 'Image'].join('');
  const WEBKIT_MASK_IMAGE_PROP = ['Webkit', 'Mask', 'Image'].join('');
  const URL_FUNC = ['u', 'r', 'l'].join('');

  // 画像がある場合
  return (
    <div
      className={tokenStyles.contentWrapper}
      style={{
        // SVGなら背景と丸めを無効化、それ以外なら従来通り
        backgroundColor: isSvg ? 'transparent' : '#4f4848ff',
        borderRadius: isSvg ? '0' : '50%',
        boxShadow: isSvg ? 'none' : undefined,
        overflow: 'visible', // SVGの端が切れないように
      }}
    >
      <img src={token.image} alt={token.name} className={tokenStyles.image} />

      {/* 塗りつぶしレイヤー */}
      {isFilled && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: token.color || 'red',
            [WEBKIT_MASK_IMAGE_PROP]: `${URL_FUNC}("${token.image}")`,
            [MASK_IMAGE_PROP]: `${URL_FUNC}("${token.image}")`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
});

type TokenProps = {
  token: TokenData;
  style?: React.CSSProperties;
  isFilled?: boolean;
  onClick?: any;
  onDoubleClick?: any;
  isDraggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>, token: TokenData) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>, token: TokenData) => void;
};

/**
 * トークンを表すコンポーネント。
 * @param {PieceData} token - トークンのデータ
 * @param {React.CSSProperties} style - 親コンポーネントから渡される絶対配置などのスタイル
 * @param {boolean} [props.isFilled=false] - マスク（着色）モード。trueの場合、画像の線を生かしたままプレイヤーカラーで塗りつぶす
 * @param {(pieceId: string) => void} onClick - 駒がクリックされた時のハンドラ
 * @param {boolean} isDraggable - ドラッグ可能かどうか
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} onDragStart - ドラッグ開始時のハンドラ
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} onDragEnd - ドラッグ終了時のハンドラ
 * @returns {JSX.Element} 駒のJSX要素
 */
export const Token = ({
  token,
  style,
  isFilled = false,
  onClick,
  onDoubleClick,
  isDraggable,
  onDragStart,
  onDragEnd,
}: TokenProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(token.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(token.id);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      e.stopPropagation();
      e.dataTransfer.setData('tokenId', token.id);
      e.dataTransfer.effectAllowed = 'move';

      onDragStart?.(e, token);
    }
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    onDragEnd?.(e, token);
  };

  return (
    <div
      className={tokenStyles.tokenContainer}
      style={{
        ...style,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TokenDisplayContent token={token} isFilled={isFilled} />
    </div>
  );
};
