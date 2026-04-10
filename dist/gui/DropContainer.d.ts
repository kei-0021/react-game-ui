import { ComponentInfo, GameParam, RoomId } from 'react-game-ui';
import { Socket } from 'socket.io-client';
interface DropContainerProps {
    scale: number;
    containerRef: React.RefObject<HTMLDivElement>;
    socket: Socket;
    roomId: RoomId;
    componentInfo: ComponentInfo[];
    gameParam: GameParam;
    setComponentInfo: (info: ComponentInfo[]) => void;
    children: React.ReactNode;
}
export declare function DropContainer({ scale, containerRef, socket, roomId, componentInfo, gameParam, setComponentInfo, children, }: DropContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DropContainer.d.ts.map