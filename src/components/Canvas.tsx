import { useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import PanToolIcon from '@mui/icons-material/PanTool';
import IconButton from '@mui/material/IconButton';
import BrushIcon from '@mui/icons-material/Brush';
import { Box } from "@mui/material";
import AdsClickIcon from '@mui/icons-material/AdsClick';
import RefreshIcon from '@mui/icons-material/Refresh';

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
  // Начальный масштаб сцены
  const [scale, setScale] = useState<number>(1);
  const [scaleShapeId, setScaleShapeId] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  /* const [isActiveIconButton, setIsActiveIconButton] = useState<boolean>(false);
  const [isActiveBrushIcon, setisActiveBrushIcon] = useState<boolean>(false);
  const [isActivePanToolIcon, setIsActivePanToolIcon] = useState<boolean>(false); */
  const [activeButton, setActiveButton] = useState<'pan' | 'brush' | 'click' | null>(null);

  const handleClickIconButton = () => {
    setActiveButton(activeButton === 'click' ? null : 'click');
    setIsDrawing(false);
  };

  const handleClickBrushIcon = () => {
    setActiveButton(activeButton === 'brush' ? null : 'brush');
    setIsDrawing(true);
  };

  const handleClickPanToolIcon = () => {
    setActiveButton(activeButton === 'pan' ? null : 'pan');
    setIsDrawing(false);
  };

  function handleReset() {
    setShapes([]); // Очистить все фигуры
    setScale(1);   // Сбросить масштаб
    setScaleShapeId(''); // Очистить id фигуры для масштабирования
  }

  function draggableOn() {
    const stage = stageRef.current;
    if (!stage) return;

    stage.draggable(true);
  }

  function draggableOff() {
    const stage = stageRef.current;
    if (!stage) return;

    stage.draggable(false);
  }

  // Функция для генерации случайного цвета
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Обработчик клика по сцене
  function handleAddShape(e: Konva.KonvaEventObject<MouseEvent>) {

    const stage = stageRef.current; // Получаем ссылку на сцену
    if (!stage || stage.draggable()) return; // Если сцена не создана или уже draggable, выходим

    const clickedShape = e.target;
    console.log("clickedShape", clickedShape)

    if (clickedShape.name() !== 'background') {
      return; // Если клик был на фоне, не добавляем новую фигуру
    }
    // Получаем координаты клика с учётом сдвига сцены
    const pointer = stage.getPointerPosition(); // Получаем координаты курсора
    if (!pointer) return; // Если координаты не найдены, выходим

    // Считываем сдвиг сцены (сколько она перемещена)
    const stagePos = stage.position(); // Получаем позицию сцены
    const offsetX = stagePos.x;
    const offsetY = stagePos.y;

    // Корректируем координаты с учётом сдвига для правильного отображения фигуры в сцене а не в окне просмотра, так сцена может быть свдинута
    const correctedX = (pointer.x - offsetX) / scale; // Делим на масштаб, чтобы координаты были правильные
    const correctedY = (pointer.y - offsetY) / scale; // Делим на масштаб, чтобы координаты были правильные

    // Выбираем случайный цвет
    const color = getRandomColor();

    // Рандомно выбираем фигуру
    const shapeTypes: ShapeType[] = ["rectangle", "circle", "triangle"];
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    const id = uuidv4()
    // Создаём новую фигуру
    const newShape: Shape = {
      id,
      type,
      x: correctedX,
      y: correctedY,
      size: 50 + Math.random() * 50,
      color,
    };

    setShapes([...shapes, newShape]);
    setScaleShapeId(id)
    console.log("handleAddShape")
  }

  function handleStartDrawingShape(_e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = stageRef.current; // Получаем ссылку на сцену
    if (!stage || stage.draggable()) return; // Если сцена не создана или уже draggable, выходим
    if (scaleShapeId !== '' && isDrawing) {
      const updatedShapes = shapes.map((shape) =>
        shape.id === scaleShapeId
          ? { ...shape, size: shape.size + 1 }
          : shape
      );
      setShapes(updatedShapes);
      console.log("handleStartDrawingShape");
    }
  }

  function handleStopDrawingShape(_e: Konva.KonvaEventObject<MouseEvent>) {
    if (scaleShapeId !== '') {
      setScaleShapeId('');
      console.log("handleStopDrawingShape")
    }
  }

  // Обработчик для изменения курсора при начале перетаскивания
  function handleDragStart() {
    document.body.style.cursor = "grabbing";
    console.log("handleDragStart")
  }
  // Обработчик для изменения курсора при окончании перетаскивания
  function handleDragEnd() {
    document.body.style.cursor = "default";
    console.log("handleDragEnd")
  }

  // Обработчик колесика мыши для зумирования относительно курсора
  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    let newScale = scale;

    // Прокрутка вверх — увеличиваем масштаб, вниз — уменьшаем
    if (e.evt.deltaY > 0) {
      newScale /= scaleBy;
    } else {
      newScale *= scaleBy;
    }

    // Ограничиваем пределы масштаба
    if (newScale > 10) newScale = 10;
    if (newScale < 0.1) newScale = 0.1;

    const pointer = stage.getPointerPosition(); // Получаем позицию курсора на сцене до зума
    if (!pointer) return;

    const oldPos = stage.position(); // Получаем позицию сцены
    const mousePointTo = {
      x: (pointer.x - oldPos.x) / scale, // Координаты курсора относительно сцены до зума, но с учетом масштаба
      y: (pointer.y - oldPos.y) / scale,
    };

    // Устанавливаем новый масштаб
    stage.scale({ x: newScale, y: newScale });

    // Пересчитываем позицию сцены относительно координат курсора на сцене c учетом нового масштаба
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    // Перемещаем сцену в новые координаты курсора
    stage.position(newPos);

    setScale(newScale);

    // Перерисовываем сцену
    stage.batchDraw();
  }

  // Обработчик для изменения позиции фигуры при перетаскивании
  function handleShapeDragMove(e: Konva.KonvaEventObject<DragEvent>, shapeId: string) {
    const updatedShapes = shapes.map((shape) =>
      shape.id === shapeId
        ? { ...shape, x: e.target.x(), y: e.target.y() }
        : shape
    );
    setShapes(updatedShapes);
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <IconButton
          onMouseDown={handleClickIconButton}
          onMouseUp={draggableOff}
          sx={{ color: activeButton === 'click' ? 'red' : '' }}
        >
          <AdsClickIcon />
        </IconButton>
        <IconButton
          onMouseDown={handleClickBrushIcon}
          onMouseUp={draggableOff}
          sx={{ color: activeButton === 'brush' ? 'red' : '' }}
        >
          <BrushIcon />
        </IconButton>
        <IconButton
          onMouseDown={handleClickPanToolIcon}
          onMouseUp={draggableOn}
          sx={{ color: activeButton === 'pan' ? 'red' : '' }}
        >
          <PanToolIcon />
        </IconButton>
        <IconButton
          onClick={handleReset}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onMouseDown={handleAddShape}
        onMouseMove={handleStartDrawingShape}
        onMouseUp={handleStopDrawingShape}
        onWheel={handleWheel}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          {/* Фон */}
          {/* Делаем прямоугольник такой ширины и сдвигаем его относителоьно сцены чтобы он покрывал ее с запасом */}
          <Rect x={-100000} y={-100000} width={200000} height={200000} fill="lightgrey" name="background" />

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
                    draggable
                    onDragMove={(e) => handleShapeDragMove(e, shape.id)} // Обновляем позицию
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
                    draggable
                    onDragMove={(e) => handleShapeDragMove(e, shape.id)} // Обновляем позицию
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
                    draggable
                  // onDragMove={(e) => handleShapeDragMove(e, shape.id)} // Обновляем позицию
                  />
                );
              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
    </>
  );
}
