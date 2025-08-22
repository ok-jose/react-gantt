import { useRef, useEffect, useCallback } from 'react';

/**
 * 简化的滚动同步 Hook
 * 使用更直接的方式实现滚动同步
 */
export const useSimpleScrollSync = () => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // 同步左侧滚动到右侧
  const syncLeftToRight = useCallback((scrollTop: number) => {
    if (!rightRef.current || isScrollingRef.current) return;

    isScrollingRef.current = true;
    rightRef.current.scrollTop = scrollTop;

    // 重置标志
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  // 同步右侧滚动到左侧
  const syncRightToLeft = useCallback((scrollTop: number) => {
    if (!leftRef.current || isScrollingRef.current) return;

    isScrollingRef.current = true;
    leftRef.current.scrollTop = scrollTop;

    // 重置标志
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  // 设置滚动监听
  useEffect(() => {
    const leftElement = leftRef.current;
    const rightElement = rightRef.current;

    if (!leftElement || !rightElement) return;

    const handleLeftScroll = () => {
      if (!isScrollingRef.current) {
        syncLeftToRight(leftElement.scrollTop);
      }
    };

    const handleRightScroll = () => {
      if (!isScrollingRef.current) {
        syncRightToLeft(rightElement.scrollTop);
      }
    };

    leftElement.addEventListener('scroll', handleLeftScroll, { passive: true });
    rightElement.addEventListener('scroll', handleRightScroll, {
      passive: true,
    });

    return () => {
      leftElement.removeEventListener('scroll', handleLeftScroll);
      rightElement.removeEventListener('scroll', handleRightScroll);
    };
  }, [syncLeftToRight, syncRightToLeft]);

  return {
    leftRef,
    rightRef,
  };
};
