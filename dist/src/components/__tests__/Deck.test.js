import { jsx as _jsx } from "react/jsx-runtime";
// src/components/__tests__/Deck.test.tsx
import { jest } from '@jest/globals'; // 必須
import { render, screen } from "@testing-library/react";
// @ts-ignore: Relative import paths need explicit file extensions in Node16 resolution
import Deck from '../Deck.tsx';
test("Deck コンポーネントが描画される", () => {
    const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    };
    render(_jsx(Deck, { socket: mockSocket }));
    expect(screen.getByText(/シャッフル/i)).toBeInTheDocument();
});
