export const PokerData: any = {
  gameId: 'poker',
  gameIcon: '🎲',
  maxPlayers: 4,
  initialDecks: [],
  draggables: {
    piece: {
      id: 'piece',
      coordinate: {
        x: 500,
        y: 500,
      },
      zIndex: 100,
      rotation: 0,
    },
    'piece-2': {
      id: 'piece-2',
      coordinate: {
        x: 500,
        y: 500,
      },
      zIndex: 100,
      rotation: 0,
    },
    'piece-1': {
      id: 'piece-1',
      coordinate: {
        x: 500,
        y: 500,
      },
      zIndex: 100,
      rotation: 0,
    },
  },
  components: [
    {
      id: '1',
      type: 'Draggable',
      props: {
        draggableId: 'piece-1',
        image: '/hanabishi.svg',
        mask: true,
        color: 'red',
        size: 100,
        isDebug: true,
      },
    },
    {
      id: '2',
      type: 'Draggable',
      props: {
        draggableId: 'piece-2',
        image: '/hanabishi.svg',
        mask: true,
        color: 'red',
        size: 100,
        isDebug: true,
      },
    },
  ],
};
