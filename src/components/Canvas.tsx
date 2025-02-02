import React, { useRef, useState, useCallback } from "react";
import Konva from "konva";
import { Stage, Layer, Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import PanToolIcon from '@mui/icons-material/PanTool';
import IconButton from '@mui/material/IconButton';
import BrushIcon from '@mui/icons-material/Brush';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Menu, MenuItem, Slider, Typography } from "@mui/material";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { MemoizedRect } from "./Rectangle";
import { MemoizedCircle } from "./Circle";
import { MemoizedTriangle } from "./Triangle";


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
  const [activeButton, setActiveButton] = useState<'pan' | 'brush' | 'click' | null>('click');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [helpMenuAnchorEl, setHelpMenuAnchorEl] = useState<null | HTMLElement>(null);

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
    }
  }

  function handleStopDrawingShape(_e: Konva.KonvaEventObject<MouseEvent>) {
    if (scaleShapeId !== '') {
      setScaleShapeId('');
    }
  }

  // Обработчик для изменения курсора при начале перетаскивания
  function handleDragStart() {
    document.body.style.cursor = "grabbing";
  }
  // Обработчик для изменения курсора при окончании перетаскивания
  function handleDragEnd() {
    document.body.style.cursor = "default";
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
  const handleShapeDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>, shapeId: string) => {
    setShapes(prevShapes => prevShapes.map((shape) =>
      shape.id === shapeId
        ? { ...shape, x: e.target.x(), y: e.target.y() }
        : shape
    ));
  }, []);

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
    const stage = stageRef.current;
    if (stage) {
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 }); // Сбросить позицию
      stage.batchDraw();
    }
    
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

  const handleShapeClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>, shapeId: string) => {
    setSelectedShapeId(shapeId);
    setAnchorEl(e.evt.currentTarget as HTMLElement);
  }, []);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangeColor = (color: string) => {
    if (selectedShapeId) {
      const updatedShapes = shapes.map((shape) =>
        shape.id === selectedShapeId ? { ...shape, color } : shape
      );
      setShapes(updatedShapes);
    }
    handleMenuClose();
  };

  const handleSizeChange = (size: number) => {
    if (selectedShapeId) {
      const updatedShapes = shapes.map((shape) =>
        shape.id === selectedShapeId ? { ...shape, size } : shape
      );
      setShapes(updatedShapes);
    }
  };

  const handleHelpClick = (event: React.MouseEvent<HTMLElement>) => {
    setHelpMenuAnchorEl(helpMenuAnchorEl ? null : event.currentTarget);
  };

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
        <IconButton
          onClick={handleHelpClick}
        >
          <QuestionMarkIcon />
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
                  <MemoizedRect
                    onClick={(e) => handleShapeClick(e, shape.id)}
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
                  <MemoizedCircle
                    onClick={(e) => handleShapeClick(e, shape.id)}
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
                  <MemoizedTriangle
                    onClick={(e) => handleShapeClick(e, shape.id)}
                    key={shape.id}
                    points={[
                      shape.x, shape.y - halfSize, // Верхняя точка
                      shape.x - halfSize, shape.y + halfSize, // Левая нижняя
                      shape.x + halfSize, shape.y + halfSize, // Правая нижняя
                    ]}
                    fill={shape.color}
                    closed
                    draggable
                  />
                );
              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            style: { backgroundColor: "lightgrey", minWidth: 170 },
          },
        }}
      >
        <MenuItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Цвет</Typography>
          <input
            type="color"
            onChange={(e) => handleChangeColor(e.target.value)}
            value={selectedShapeId ? shapes.find(shape => shape.id === selectedShapeId)?.color : "#000000"}
          />
        </MenuItem>
        <MenuItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Размер</Typography>
          <Slider
            value={selectedShapeId ? shapes.find(shape => shape.id === selectedShapeId)?.size || 50 : 50}
            onChange={(_e, newSize) => handleSizeChange(newSize as number)}
            min={50}
            max={150}
            sx={{ width: 1 / 2 }}
          />
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={helpMenuAnchorEl}
        open={Boolean(helpMenuAnchorEl)}
        onClose={() => setHelpMenuAnchorEl(null)}
        slotProps={{
          paper: {
            style: { backgroundColor: "lightgrey", minWidth: 250 },
          },
        }}
      >
        <MenuItem>
          <Typography variant="h6">Как использовать:</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Используйте кнопки на панели инструментов для управления:</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - Режим "Классический" для добавления фигур</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - Режим "Рисование" для добавления и изменения размера фигуры на лету</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - Режим "Перемещение" для перемещения холста</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - Режим "Сброс" для очистки холста</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - Справка</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>Возможности:</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - Изменение масштаба холста - используйте колесико мыши</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - В режиме "Классический" - нажмите на холст, чтобы добавить фигуру</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - В режиме "Рисование" - нажмите на холст и не отпуская курсор мыши двигайте мышью, затем отпустите</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - В режимах "Классический", "Рисование" и "Перемещение" - нажмите на фигуру, чтобы изменить ее цвет или размер в выпадающем меню</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - В режимах "Классический", "Рисование" и "Перемещение" - нажмите и удерживайте фигуру, чтобы переместить ее</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
