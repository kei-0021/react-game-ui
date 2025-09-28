// *.module.css を TypeScript で認識させるためのモジュール.

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}