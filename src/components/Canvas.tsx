import { useRef } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import Konva from "konva";

export default function Canvas() {
  const stageRef = useRef<Konva.Stage>(null);

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      draggable // Делаем всю сцену перетаскиваемой
      ref={stageRef}
    >
      <Layer>
        {/* Огромный фон, чтобы видеть перемещение */}
        <Rect
          x={-5000}
          y={-5000}
          width={10000}
          height={10000}
          fill="#f0f0f0"
        />
        {/* Тестовая фигура */}
        <Circle x={200} y={200} radius={50} fill="red" />
      </Layer>
    </Stage>
  );
}
