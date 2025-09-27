// src/components/__tests__/Deck.test.tsx
import { jest } from '@jest/globals'; // 必須
import { render, screen } from "@testing-library/react";
import type { Socket } from "socket.io-client";
// @ts-ignore: Relative import paths need explicit file extensions in Node16 resolution
import Deck from '../Deck.tsx';

test("Deck コンポーネントが描画される", () => {
  const mockSocket: Partial<Socket> = {
    on: jest.fn() as unknown as Socket['on'],
    off: jest.fn() as unknown as Socket['off'],
    emit: jest.fn() as unknown as Socket['emit'],
  };

  render(<Deck socket={mockSocket as Socket} />);
  expect(screen.getByText(/シャッフル/i)).toBeInTheDocument();
});
