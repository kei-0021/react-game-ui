export type Card = {
  id: string;
  name: string;
  description?: string;
  onUse?: () => void; // ここが追加
  location: "deck" | "field" | { hand: string };
};

export function Card({ id, name, description }: Card) {
  return <div>{name}</div>;
}
