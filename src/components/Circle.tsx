import { memo } from "react";
import Konva from "konva";
import { Circle } from "react-konva";

export const MemoizedCircle = memo(function MemoizedCircle({
  onClick,
  x,
  y,
  radius,
  fill,
  draggable,
  onDragMove,
}: {
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  x: number;
  y: number;
  radius: number;
  fill: string;
  draggable: boolean;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
}) {
  return (
    <Circle
      onClick={onClick}
      x={x}
      y={y}
      radius={radius}
      fill={fill}
      draggable={draggable}
      onDragMove={onDragMove}
    />
  );
});