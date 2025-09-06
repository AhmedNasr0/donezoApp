'use client';

import * as React from 'react';
import type { WindowItem, Connection } from '@/lib/types';
import { WindowFrame } from './window-frame';
import { ConnectionLine } from './connection-line';
import { EnhancedConnectionLine } from './enhanced-connection-line';
import { X } from 'lucide-react';

interface WhiteboardCanvasProps {
  items: WindowItem[];
  connections: Connection[];
  linking: { from: string } | null;
  scale: number;
  panOffset: { x: number; y: number };
  selection: any; // Will be typed properly from the hook

  onUpdateItem: (item: WindowItem) => void;
  onDeleteItem: (id: string) => void;
  onFocusItem: (id: string) => void;
  onToggleConnection: (id: string) => void;
  onPanChange: (offset: { x: number; y: number }) => void;
  onScaleChange: (scale: number) => void;
  onConnectionDelete?: (connectionId: string) => void;
}

export function WhiteboardCanvas({
  items,
  connections,
  linking,
  scale,
  panOffset,
  selection,

  onUpdateItem,
  onDeleteItem,
  onFocusItem,
  onToggleConnection,
  onPanChange,
  onScaleChange,
  onConnectionDelete,
}: WhiteboardCanvasProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [lastMousePos, setLastMousePos] = React.useState({ x: 0, y: 0 });
  const canvasRef = React.useRef<HTMLDivElement>(null);
  
  // Performance optimization refs for panning
  const panAnimationFrameRef = React.useRef<number>();
  const lastPanUpdateTime = React.useRef<number>(0);
  
  // Infinite canvas dimensions
  const CANVAS_SIZE = 50000; // Large but finite for performance
  const GRID_SIZE = 50;


  // Handle mouse wheel for zooming
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!canvasRef.current) return;
      
      e.preventDefault();
      
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate zoom direction and amount with smoother scaling
      const zoomDirection = e.deltaY > 0 ? -1 : 1;
      const zoomFactor = 1 + (zoomDirection * 0.07); // Reduced from 0.1 to 0.05 for smoother zoom
      const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor)); // Increased max zoom from 3 to 5
      
      if (newScale !== scale) {
        // Calculate new pan offset to zoom towards mouse cursor
        const scaleRatio = newScale / scale;
        const newPanOffset = {
          x: mouseX - (mouseX - panOffset.x) * scaleRatio,
          y: mouseY - (mouseY - panOffset.y) * scaleRatio,
        };
        
        onScaleChange(newScale);
        onPanChange(newPanOffset);
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [scale, panOffset, onScaleChange, onPanChange]);

  // Handle mouse movement for linking, panning, and selection
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        // Cancel previous animation frame if it exists
        if (panAnimationFrameRef.current) {
          cancelAnimationFrame(panAnimationFrameRef.current);
        }
        
        // Use requestAnimationFrame for smooth panning
        panAnimationFrameRef.current = requestAnimationFrame(() => {
          const now = performance.now();
          // Throttle updates to 60fps max
          if (now - lastPanUpdateTime.current >= 16) {
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;
            
            // Adjust panning speed based on scale for consistent feel
            // Use a more sophisticated scaling that feels natural at all zoom levels
            const panSpeedMultiplier = Math.max(0.3, Math.min(1.2, 1 / scale));
            const scaleAdjustedDeltaX = deltaX * panSpeedMultiplier;
            const scaleAdjustedDeltaY = deltaY * panSpeedMultiplier;
            
            onPanChange({
              x: panOffset.x + scaleAdjustedDeltaX,
              y: panOffset.y + scaleAdjustedDeltaY,
            });
            
            setLastMousePos({ x: e.clientX, y: e.clientY });
            lastPanUpdateTime.current = now;
          }
        });
      }
      
      if (selection.isBoxSelecting) {
        selection.updateBoxSelection(e.clientX, e.clientY);
      }
      
      if (linking && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePosition({ 
          x: (e.clientX - rect.left - panOffset.x) / scale,
          y: (e.clientY - rect.top - panOffset.y) / scale 
        });
      }
    };

    const handleMouseUp = () => {
      if (selection.isBoxSelecting) {
        selection.endBoxSelection(items, scale, panOffset);
      }
      
      // Cancel any pending panning animation frame
      if (panAnimationFrameRef.current) {
        cancelAnimationFrame(panAnimationFrameRef.current);
        panAnimationFrameRef.current = undefined;
      }
      
      setIsPanning(false);
    };

    if (isPanning || linking || selection.isBoxSelecting) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Cancel any pending animation frames
      if (panAnimationFrameRef.current) {
        cancelAnimationFrame(panAnimationFrameRef.current);
        panAnimationFrameRef.current = undefined;
      }
    };
  }, [isPanning, linking, selection, scale, panOffset, lastMousePos, items, onPanChange]);

  // Handle mouse down based on current tool
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start interaction if clicking on window frames or UI elements
    if ((e.target as HTMLElement).closest('.window-frame') || 
        (e.target as HTMLElement).closest('button') ||
        (e.target as HTMLElement).closest('input') ||
        (e.target as HTMLElement).closest('textarea')) {
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = (e.clientX - rect.left - panOffset.x) / scale;
    const startY = (e.clientY - rect.top - panOffset.y) / scale;

    // Handle linking mode
    if (linking) {
      // In link mode, just wait for clicks on connection handles
      return;
    }
    
    // Default select tool behavior
    const isMultiSelect = e.ctrlKey || e.metaKey;
    
    // Check for Shift-drag for temporary box selection
    if (e.shiftKey) {
      selection.startBoxSelection(startX, startY);
      return;
    }
    
    // If not multi-selecting, clear current selection
    if (!isMultiSelect) {
      selection.clearSelection();
    }
    
    // Start panning
    setIsPanning(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const getHandlePosition = (item: WindowItem, side: 'left' | 'right') => {
    return {
      x: item.position.x + (side === 'right' ? item.size.width : 0),
      y: item.position.y + item.size.height / 2,
    };
  };
  
  const handleDisconnect = (fromId: string, toId: string) => {
    const fromItem = items.find(item => item.id === fromId);
    if (fromItem) {
      const updatedConnections = fromItem.connections.filter(c => c.to !== toId);
      onUpdateItem({ ...fromItem, connections: updatedConnections });
    }
  };

  const linkingFromItem = linking ? items.find(item => item.id === linking.from) : null;

  // Generate grid pattern for infinite canvas
  const renderGrid = () => {
    const gridSpacing = GRID_SIZE * scale;
    const offsetX = panOffset.x % gridSpacing;
    const offsetY = panOffset.y % gridSpacing;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cols = Math.ceil(viewportWidth / gridSpacing) + 2;
    const rows = Math.ceil(viewportHeight / gridSpacing) + 2;
    
    const lines = [];
    
    // Vertical lines
    for (let i = -1; i <= cols; i++) {
      const x = offsetX + i * gridSpacing;
      lines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={viewportHeight}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.2}
        />
      );
    }
    
    // Horizontal lines
    for (let i = -1; i <= rows; i++) {
      const y = offsetY + i * gridSpacing;
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={viewportWidth}
          y2={y}
          stroke="currentColor"
          strokeWidth={0.5}
          opacity={0.2}
        />
      );
    }
    
    return (
      <svg 
        className="absolute inset-0 pointer-events-none text-muted-foreground/30"
        style={{ width: '100%', height: '100%' }}
      >
        {lines}
      </svg>
    );
  };

  return (
    <main 
      ref={canvasRef} 
      className="h-full w-full overflow-visible cursor-grab active:cursor-grabbing" 
      onMouseDown={handleMouseDown}
      style={{ 
        cursor: isPanning ? 'grabbing' : 
                linking ? 'crosshair' :
                'grab'
      }}
    >
      {/* Infinite grid background */}
      {renderGrid()}
      
      
      <div
        className="relative pointer-events-auto"
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          transform: `scale(${scale}) translate(${panOffset.x / scale}px, ${panOffset.y / scale}px)`,
          transformOrigin: '0 0',
          overflow: 'visible',
          willChange: isPanning ? 'transform' : 'auto',
        }}
      >
        <svg className="absolute pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Enhanced connections */}
          {connections.map((connection) => {
            const fromItem = items.find(item => item.id === connection.from);
            const toItem = items.find(item => item.id === connection.to);
            if (!fromItem || !toItem) return null;

            return (
              <EnhancedConnectionLine
                key={connection.id}
                connection={connection}
                fromItem={fromItem}
                toItem={toItem}
                scale={scale}
                onDelete={onConnectionDelete}
                obstacles={items.filter(item => item.id !== connection.from && item.id !== connection.to)}
              />
            );
          })}
          
          {/* Temporary connection while linking */}
          {linkingFromItem && (
            <ConnectionLine from={getHandlePosition(linkingFromItem, 'right')} to={mousePosition} />
          )}
        </svg>

        {items.map((item) => (
          <WindowFrame
            key={item.id}
            item={item}
            items={items}
            isLinking={!!linking}
            isLinkingFrom={linking?.from === item.id}
            isSelected={selection.isSelected(item.id)}
            scale={scale}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            onFocus={onFocusItem}
            onToggleConnection={onToggleConnection}
            onSelect={(id: string, multiSelect: boolean) => selection.selectItem(id, multiSelect)}
          />
        ))}
        
        {/* Selection box */}
        {selection.selectionBox && (
          <div
            className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
            style={{
              left: Math.min(selection.selectionBox.startX, selection.selectionBox.endX),
              top: Math.min(selection.selectionBox.startY, selection.selectionBox.endY),
              width: Math.abs(selection.selectionBox.endX - selection.selectionBox.startX),
              height: Math.abs(selection.selectionBox.endY - selection.selectionBox.startY),
              zIndex: 1000,
            }}
          />
        )}
      </div>
    </main>
  );
}
