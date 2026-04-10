import { ComponentInfo, GameParam, RoomId } from 'react-game-ui';
interface DropContainerProps {
    scale: number;
    containerRef: React.RefObject<HTMLDivElement>;
    socket: any;
    roomId: RoomId;
    componentInfo: ComponentInfo[];
    games: GameParam[];
    setComponentInfo: (info: ComponentInfo[]) => void;
    children: React.ReactNode;
}
export declare function DropContainer({ scale, containerRef, socket, roomId, componentInfo, games, setComponentInfo, children, }: DropContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DropContainer.d.ts.map