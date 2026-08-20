import React, { useRef, useState, useEffect } from 'react';

export interface ScrollableTextProps {
  text: string;
  className?: string;
  isHovered?: boolean;
}

export const ScrollableText: React.FC<ScrollableTextProps> = ({
  text,
  className = '',
  isHovered: externalIsHovered,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [internalIsHovered, setInternalIsHovered] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);

  const isHovered = externalIsHovered !== undefined ? externalIsHovered : internalIsHovered;

  const checkOverflow = () => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.scrollWidth;
      const diff = textWidth - containerWidth;
      setOverflowDistance(diff > 0 ? diff : 0);
    }
  };

  useEffect(() => {
    checkOverflow();
  }, [text]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find the enclosing chat item row (.group, button, or container)
    const hoverTarget = container.closest('.group') || container.closest('button') || container;

    const onEnter = () => {
      checkOverflow();
      setInternalIsHovered(true);
    };

    const onLeave = () => {
      setInternalIsHovered(false);
    };

    hoverTarget.addEventListener('mouseenter', onEnter);
    hoverTarget.addEventListener('mouseleave', onLeave);

    return () => {
      hoverTarget.removeEventListener('mouseenter', onEnter);
      hoverTarget.removeEventListener('mouseleave', onLeave);
    };
  }, [text]);

  const SCROLL_SPEED = 50; 
  const duration = overflowDistance > 0 ? Math.max(0.6, overflowDistance / SCROLL_SPEED) : 0;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden relative select-none"
      title={text}
    >
      <span
        ref={textRef}
        className={`whitespace-nowrap ${
          isHovered && overflowDistance > 0 ? 'inline-block' : 'block truncate'
        } ${className}`}
        style={{
          transform:
            isHovered && overflowDistance > 0
              ? `translateX(-${overflowDistance + 4}px)`
              : 'translateX(0)',
          transition:
            isHovered && overflowDistance > 0
              ? `transform ${duration}s linear 0.25s`
              : 'none',
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default ScrollableText;
