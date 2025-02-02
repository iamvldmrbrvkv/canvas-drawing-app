import { memo } from "react";
import Konva from "konva";
import { Rect } from "react-konva";

export const MemoizedRect = memo(function MemoizedRect({
  onClick,
  x,
  y,
  width,
  height,
  fill,
  draggable,
  onDragMove,
}: {
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  draggable: boolean;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
}) {
  return (
    <Rect
      onClick={onClick}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      draggable={draggable}
      onDragMove={onDragMove}
    />
  );
});
