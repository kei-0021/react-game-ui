import type { ComponentInfo } from '../types/server.js';
interface DynamicProps {
    type: ComponentInfo['type'];
    props: any;
    socket: any;
    roomId: string;
}
export declare const DynamicComponent: ({ type, props, socket, roomId }: DynamicProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=DynamicComponent.d.ts.map