// src/components/Piece.tsx
import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';
import styles from './Piece.module.css';

export type PieceProps = {
  piece: PieceData;
  style: React.CSSProperties;
  onClick: (pieceId: string) => void;
  isDraggable: boolean;
  isFilled?: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
  onDragEnd: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
};

/**
 * ゲーム盤上に配置される個々の駒コンポーネント。
 * @param {PieceData} props.piece - 駒のデータ（ID、名前、画像URL、プレイヤーカラーなど）
 * @param {React.CSSProperties} props.style - 親コンポーネントから渡される絶対配置などのスタイル
 * @param {(pieceId: string) => void} props.onClick - 駒がクリックされた時のハンドラ
 * @param {boolean} props.isDraggable - 駒がドラッグ可能かどうか
 * @param {boolean} [props.isFilled=false] - マスク（着色）モード。trueの場合、画像の線を生かしたままプレイヤーカラーで塗りつぶす
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} props.onDragStart - ドラッグ開始時のハンドラ
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} props.onDragEnd - ドラッグ終了時のハンドラ
 * @returns {JSX.Element} 駒のJSX要素
 */
export function Piece({
  piece,
  style,
  onClick,
  isDraggable,
  isFilled = false,
  onDragStart,
  onDragEnd,
}: PieceProps): JSX.Element {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(piece.id);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      e.stopPropagation();
      e.dataTransfer.setData('pieceId', piece.id);
      e.dataTransfer.effectAllowed = 'move';

      if (piece.image) {
        e.dataTransfer.setDragImage(e.currentTarget, 45, 45);
      }

      onDragStart(e, piece);
    }
  };

  const pieceClasses = [styles.piece, isDraggable ? styles.draggable : styles.clickable].join(' ');

  return (
    <div
      className={pieceClasses}
      style={{
        ...style,
        backgroundColor: piece.image ? 'transparent' : piece.color,
        // 縁取り（drop-shadow）を完全に削除
        filter: 'none',
        border: 'none',
        outline: 'none',
        // 画像なしのベタ塗り時のみ、テキストを中央配置にする
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // boxShadow を画像なしの時だけ付けるか、完全に消すかはお好みで
        boxShadow: piece.image ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
      }}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={(e) => onDragEnd(e, piece)}
    >
      {piece.image ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            pointerEvents: 'none',
          }}
        >
          <img
            src={piece.image}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />

          {isFilled && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: piece.color,
                WebkitMaskImage: `url("${piece.image}")`,
                maskImage: `url("${piece.image}")`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                mixBlendMode: 'multiply',
              }}
            />
          )}
        </div>
      ) : (
        piece.name.substring(0, 1)
      )}
    </div>
  );
}
