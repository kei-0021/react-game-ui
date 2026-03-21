// src/components/__tests__/Deck.test.tsx
import { render, screen } from '@testing-library/react';
import type { Socket } from 'socket.io-client';
import { expect, test, vi } from 'vitest';
// @ts-ignore
import Deck from '../Deck.tsx';

test('Deck コンポーネントが描画される', () => {
  // jest.fn() を vi.fn() に置き換える
  const mockSocket: Partial<Socket> = {
    on: vi.fn() as unknown as Socket['on'],
    off: vi.fn() as unknown as Socket['off'],
    emit: vi.fn() as unknown as Socket['emit'],
  };

  render(<Deck socket={mockSocket as Socket} />);
  expect(screen.queryByText(/シャッフル/i)).not.toBeNull();
});
