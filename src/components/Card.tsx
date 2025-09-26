export type Card = {
  id: string;
  name: string;
  description?: string;
};

export function Card({ id, name, description }: Card) {
  return <div>{name}</div>;
}
