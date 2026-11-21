import { useParams } from 'react-router-dom';
import { MainBoard } from './MainBoard';
import { ComponentsBoard } from './ComponentsBoard';
import { PrimitivesBoard } from './PrimitivesBoard';
import './designBoard.css';

// Dev-only design-system route (Step 3).
//   /design             → all boards, stacked
//   /design/main        → the Main board (tokens)            ↔ design-reference/snapshots/Main.html
//   /design/components  → the Components board               ↔ design-reference/snapshots/Components.html
//   /design/primitives  → every other Step 3 design component
const BOARDS = {
  main: MainBoard,
  components: ComponentsBoard,
  primitives: PrimitivesBoard,
} as const;

type BoardKey = keyof typeof BOARDS;

const isBoardKey = (value: string | undefined): value is BoardKey => value !== undefined && value in BOARDS;

export function DesignPage() {
  const { board } = useParams();
  if (isBoardKey(board)) {
    const Board = BOARDS[board];
    return <Board />;
  }
  return (
    <>
      <MainBoard />
      <ComponentsBoard />
      <PrimitivesBoard />
    </>
  );
}
