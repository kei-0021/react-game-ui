export type Card = {
  id: string;
  name: string;
  description?: string;
  onPlay?: () => void; // ここが追加
  location: "deck" | "field" | { hand: string };
};