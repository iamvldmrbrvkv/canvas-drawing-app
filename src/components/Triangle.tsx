import { Line } from "react-konva";
import Konva from "konva";
import { memo } from "react";

export const MemoizedTriangle = memo(function MemoizedTriangle({
  onClick,
  points,
  fill,
  closed,
  draggable,
}: {
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  points: number[];
  fill: string;
  closed: boolean;
  draggable: boolean;
}) {
  return (
    <Line
      onClick={onClick}
      points={points}
      fill={fill}
      closed={closed}
      draggable={draggable}
    />
  );
});