import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';

function Draggable({ children, style }) {
  const dragRef = useRef(null);
  let isMouseDown = false;
  let offset = [0, 0];

  const onMouseDown = (e) => {
    isMouseDown = true;
    const dragDiv = dragRef.current;
    if (!dragDiv) return;

    const isTouch = /touch/g.test(e.type);
    const x = isTouch ? e.touches[0].clientX : e.clientX;
    const y = isTouch ? e.touches[0].clientY : e.clientY;

    offset = [
      dragDiv.offsetLeft - x,
      dragDiv.offsetTop - y
    ];

    dragDiv.addEventListener('mouseup', onMouseUp, true);
    dragDiv.addEventListener('touchend', onMouseUp, true);

    document.addEventListener('contextmenu', onContextMenu, false);
    document.addEventListener('touchmove', onMouseMove, true);
    document.addEventListener('mousemove', onMouseMove, true);
  }

  const onMouseUp = () => {
    isMouseDown = false;
    document.removeEventListener('touchmove', onMouseMove, true);
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('contextmenu', onContextMenu, false);
  }

  const onMouseMove = useCallback((e) => {
    const isTouch = /touch/g.test(e.type);

    if (!isTouch) {
      e.preventDefault();
    }

    if (isMouseDown && dragRef.current) {
      const x = isTouch ? e.touches[0].clientX : e.clientX;
      const y = isTouch ? e.touches[0].clientY : e.clientY;

      dragRef.current.style.left = (x + offset[0]) + 'px';
      dragRef.current.style.top = (y + offset[1]) + 'px';
    }
  }, []);

  const onContextMenu = () => {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('touchmove', onMouseMove, true);
  }

  useEffect(() => {
    const dragDiv = dragRef.current;

    dragDiv?.addEventListener('touchstart', onMouseDown, true);
    dragDiv?.addEventListener('mousedown', onMouseDown, true);

    return () => {
      dragDiv?.removeEventListener('mousedown', onMouseDown, true);
      dragDiv?.removeEventListener('mouseup', onMouseUp, true);
      document.removeEventListener('mousemove', onMouseMove, true);

      dragDiv?.removeEventListener('touchstart', onMouseDown, true);
      dragDiv?.removeEventListener('touchend', onMouseUp, true);
      document.removeEventListener('touchmove', onMouseMove, true);

      document.removeEventListener('contextmenu', onContextMenu, false);
    }
  }, []);

  return <div ref={dragRef} style={style}>{children}</div>
}

export default Draggable;