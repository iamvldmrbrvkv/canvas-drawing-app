import { useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import { v4 as uuidv4 } from "uuid";

// Тип фигуры
type ShapeType = "rectangle" | "circle" | "triangle";

// Интерфейс для фигуры
interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function Canvas() {
  // Создаём ссылку на сцену
  const stageRef = useRef<Konva.Stage>(null);
  // Состояние для хранения фигур
  const [shapes, setShapes] = useState<Shape[]>([]);

  // Обработчик клика по сцене
  function handleStageClick(_event: Konva.KonvaEventObject<MouseEvent>) {
    const stage = stageRef.current; // Получаем ссылку на сцену
    if (!stage) return; // Если сцена не создана, выходим

    // Получаем координаты клика с учётом сдвига сцены
    const pointer = stage.getPointerPosition(); // Получаем координаты курсора
    if (!pointer) return; // Если координаты не найдены, выходим

    // Считываем сдвиг сцены (сколько она перемещена)
    const stagePos = stage.position(); // Получаем позицию сцены
    const offsetX = stagePos.x;
    const offsetY = stagePos.y;

    // Корректируем координаты с учётом сдвига для правильного отображения фигуры в сцене а не в окне просмотра, так сцена может быть свдинута
    const correctedX = pointer.x - offsetX; // Корректируем координаты
    const correctedY = pointer.y - offsetY; // Корректируем координаты

    // Выбираем случайный цвет
    const colors = ["red", "blue", "green", "purple", "orange"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Рандомно выбираем фигуру
    const shapeTypes: ShapeType[] = ["rectangle", "circle", "triangle"];
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    // Создаём новую фигуру
    const newShape: Shape = {
      id: uuidv4(),
      type,
      x: correctedX,
      y: correctedY,
      size: 50 + Math.random() * 50,
      color,
    };

    setShapes([...shapes, newShape]);
  }

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      draggable
      ref={stageRef}
      onMouseDown={handleStageClick}
    >
      <Layer>
        {/* Фон */}
        {/* Делаем прямоугольник такой ширины и сдвигаем его относителоьно сцены чтобы он покрывал ее с запасом */}
        <Rect x={-10000} y={-10000} width={20000} height={20000} fill="lightgrey" />

        {/* Отрисовка фигур */}
        {shapes.map((shape) => {
          switch (shape.type) {
            case "rectangle":
              return (
                <Rect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.size}
                  height={shape.size}
                  fill={shape.color}
                />
              );
            case "circle":
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.size / 2}
                  fill={shape.color}
                />
              );
            case "triangle":
              const size = shape.size;
              const halfSize = size / 2;
              return (
                <Line
                  key={shape.id}
                  points={[
                    shape.x, shape.y - halfSize, // Верхняя точка
                    shape.x - halfSize, shape.y + halfSize, // Левая нижняя
                    shape.x + halfSize, shape.y + halfSize, // Правая нижняя
                  ]}
                  fill={shape.color}
                  closed
                />
              );
            default:
              return null;
          }
        })}
      </Layer>
    </Stage>
  );
}
