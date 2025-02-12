import React, { useRef, useState, useCallback } from "react";
import Konva from "konva";
import { Stage, Layer, Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import PanToolIcon from '@mui/icons-material/PanTool';
import IconButton from '@mui/material/IconButton';
import BrushIcon from '@mui/icons-material/Brush';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Menu, MenuItem, Slider, Typography, Tooltip } from "@mui/material";
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
  // Состояние для хранения id фигуры для масштабирования
  const [scaleShapeId, setScaleShapeId] = useState<string>('');
  // Состояние рисования
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  // Состояние активной кнопки
  const [activeButton, setActiveButton] = useState<'pan' | 'brush' | 'click' | null>('click');
  // Состояние для позиции меню редактиктирования фигуры
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  // Состояния для хранения id выбранной фигуры для редактирования
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  // Состояние якоря относительно которого будет открываться меню справки
  const [helpMenuAnchorEl, setHelpMenuAnchorEl] = useState<null | HTMLElement>(null);
  // Создаём useRef для хранения предыдущей X-координаты
  const prevXRef = useRef<number | null>(null);

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
    // Получаем ссылку на сцену
    const stage = stageRef.current;
    const clickedShape = e.target;
    // Если сцена не создана или уже draggable или если клик был на фоне, выходим
    if (!stage || stage.draggable() || clickedShape.name() !== 'background') return;
    // Получаем координаты клика с учётом сдвига сцены
    // Получаем координаты курсора
    const pointer = stage.getPointerPosition();
    if (!pointer) return; // Если координаты не найдены, выходим
    // Считываем сдвиг сцены (сколько она перемещена)
    const stagePos = stage.position(); // Получаем позицию сцены
    const offsetX = stagePos.x;
    const offsetY = stagePos.y;
    // Корректируем координаты с учётом сдвига для правильного отображения фигуры в сцене а не в окне просмотра, так сцена может быть свдинута
    // Делим на масштаб, чтобы координаты были правильные
    const correctedX = (pointer.x - offsetX) / scale;
    const correctedY = (pointer.y - offsetY) / scale;
    // Выбираем случайный цвет
    const color = getRandomColor();
    // Рандомно выбираем фигуру
    const shapeTypes: ShapeType[] = ["rectangle", "circle", "triangle"];
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const id = uuidv4();
    // Создаём новую фигуру
    const newShape: Shape = {
      id,
      type,
      x: correctedX,
      y: correctedY,
      size: 50 + Math.floor(Math.random() * 101),
      color,
    };
    setShapes([...shapes, newShape]);
    setScaleShapeId(id);
  }

  // Обработчик для начала рисования фигуры
  function handleStartDrawingShape(_e: Konva.KonvaEventObject<MouseEvent>) {
    // Получаем ссылку на сцену
    const stage = stageRef.current;
    // Если сцена не создана, draggable, нет scaleShapeId или isDrawing = false, выходим
    if (!stage || stage.draggable() || scaleShapeId === '' || !isDrawing) return;
    // Получаем координаты курсора
    const pointer = stage.getPointerPosition();
    if (!pointer) return; // Если координаты не найдены, выходим
    // Сохраняем текущую X-координату мыши (currentX)
    const currentX = pointer.x;
    // Берём предыдущее значение prevX (храним его в prevXRef)
    const prevX = prevXRef.current;
    // Обрабатываем первый случай когда prevX ещё не был установлен
    if (prevX === null) {
      prevXRef.current = currentX;
      return;
    }
    // Определяем, в какую сторону двигается мышь и разницу размера фигуры в пикселях
    const deltaX = currentX - prevX; // deltaX > 0 - вправо, deltaX < 0 - влево
    // Устанавливаем динамично меняющийся размер фигуры с ограничениями 10 и 300 пикселей
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === scaleShapeId
          ? { ...shape, size: Math.max(10, Math.min(shape.size + deltaX, 300)) }
          : shape
      )
    );
    // Обновляем предыдущую X-координату (prevX) чтобы не было скачков при расчете const deltaX = currentX - prevX
    prevXRef.current = currentX;
  }

  // Обработчик для окончания рисования фигуры
  function handleStopDrawingShape(_e: Konva.KonvaEventObject<MouseEvent>) {
    prevXRef.current = null;
    setScaleShapeId('');
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
    // Получаем позицию курсора на сцене до зума
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    // Получаем позицию сцены
    const oldPos = stage.position();
    // Координаты курсора относительно сцены до зума, но с учетом масштаба
    const mousePointTo = {
      x: (pointer.x - oldPos.x) / scale,
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

  // ОБработчики для изменения цвета кнопок меню и изменениюя режимов
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

  // Обработчик для сброса сцены
  function handleReset() {
    const stage = stageRef.current;
    if (stage) {
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      stage.batchDraw();
    }
    // Очистить все фигуры
    setShapes([]);
    // Сбросить масштаб
    setScale(1);
    // Очистить id фигуры для масштабирования
    setScaleShapeId('');
  }

  // Обработички для включения / отключения draggable сцены
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

  // Обработчки для отрытия меню редактирования фигуры
  const handleShapeClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>, shapeId: string) => {
    setSelectedShapeId(shapeId);
    // Сохраняем координаты клика для позиционирования меню редактирования
    setMenuPosition({ left: e.evt.clientX, top: e.evt.clientY });
  }, []);

  // Сбрасываем позицию меню редактирования фигуры
  const handleMenuClose = () => {
    setMenuPosition(null);
  };

  // Обработчк для изменения цвета фигуры
  const handleChangeColor = (color: string) => {
    if (selectedShapeId) {
      const updatedShapes = shapes.map((shape) =>
        shape.id === selectedShapeId
          ? { ...shape, color }
          : shape
      );
      setShapes(updatedShapes);
    }
    handleMenuClose();
  };

  // Обработчк для изменения размера фигуры
  const handleSizeChange = (size: number) => {
    if (selectedShapeId) {
      const updatedShapes = shapes.map((shape) =>
        shape.id === selectedShapeId
          ? { ...shape, size }
          : shape
      );
      setShapes(updatedShapes);
    }
  };

  // Обработчик для открытия меню справки
  const handleHelpClick = (e: React.MouseEvent<HTMLElement>) => {
    // Eсли есть якорь то закрываем меню, если нет то открываем
    setHelpMenuAnchorEl(helpMenuAnchorEl ? null : e.currentTarget);
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
        <Tooltip title={`Режим "Классический" - нажмите на холст, чтобы добавить фигуру`}>
          <IconButton
            onMouseDown={handleClickIconButton}
            onMouseUp={draggableOff}
            sx={{ color: activeButton === 'click' ? 'red' : '' }}
          >
            <AdsClickIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Режим "Рисование" - нажмите на холст и не отпуская курсор мыши двигайте мышью, затем отпустите`}>
          <IconButton
            onMouseDown={handleClickBrushIcon}
            onMouseUp={draggableOff}
            sx={{ color: activeButton === 'brush' ? 'red' : '' }}
          >
            <BrushIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Режим "Перемещение холста" - нажмите на пустое место на холсте и не отпуская курсор мыши двигайте мышью, затем отпустите`}>
          <IconButton
            onMouseDown={handleClickPanToolIcon}
            onMouseUp={draggableOn}
            sx={{ color: activeButton === 'pan' ? 'red' : '' }}
          >
            <PanToolIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Режим "Сброс" для очистки холста`}>
          <IconButton
            onClick={handleReset}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Справка`}>
          <IconButton
            onClick={handleHelpClick}
          >
            <QuestionMarkIcon />
          </IconButton>
        </Tooltip>
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
        anchorReference="anchorPosition"
        anchorPosition={menuPosition || { top: 0, left: 0 }}
        open={Boolean(menuPosition)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            style: { backgroundColor: "lightgrey", minWidth: 170 },
          },
        }}
        disableAutoFocusItem={true}
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
            min={10}
            max={300}
            sx={{ width: 1 / 2 }}
            valueLabelDisplay="auto"
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
          <Typography>   - Режим "Перемещение холста" для перемещения холста</Typography>
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
          <Typography>   - В режиме "Рисование" - нажмите на холст и не отпуская курсор мыши двигайте мышью влево или вправо для изменения размера фигуры, затем отпустите</Typography>
        </MenuItem>
        <MenuItem>
          <Typography>   - В режиме "Перемещение холста" - нажмите на пустое место на холсте и не отпуская курсор мыши двигайте мышью, затем отпустите</Typography>
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
