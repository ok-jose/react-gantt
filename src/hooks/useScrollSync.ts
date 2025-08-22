import { useRef, useEffect, useCallback } from 'react';

export interface UseScrollSyncOptions {
  /**
   * 是否启用滚动同步，默认 true
   */
  enabled?: boolean;
  /**
   * 滚动同步的节流时间（毫秒），默认 16
   */
  throttleMs?: number;
}

/**
 * 滚动同步 Hook
 * 用于同步左侧任务列表和右侧时间网格的滚动
 */
export const useScrollSync = (options: UseScrollSyncOptions = {}) => {
  const { enabled = true, throttleMs = 16 } = options;

  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  // 同步左侧滚动到右侧
  const syncLeftToRight = useCallback(
    (scrollTop: number) => {
      if (!enabled || !rightContainerRef.current || isScrollingRef.current)
        return;

      const now = Date.now();
      if (now - lastScrollTimeRef.current < throttleMs) return;

      isScrollingRef.current = true;
      lastScrollTimeRef.current = now;

      rightContainerRef.current.scrollTop = scrollTop;

      // 重置滚动标志
      setTimeout(() => {
        isScrollingRef.current = false;
      }, throttleMs);
    },
    [enabled, throttleMs]
  );

  // 同步右侧滚动到左侧
  const syncRightToLeft = useCallback(
    (scrollTop: number) => {
      if (!enabled || !leftContainerRef.current || isScrollingRef.current)
        return;

      const now = Date.now();
      if (now - lastScrollTimeRef.current < throttleMs) return;

      isScrollingRef.current = true;
      lastScrollTimeRef.current = now;

      leftContainerRef.current.scrollTop = scrollTop;

      // 重置滚动标志
      setTimeout(() => {
        isScrollingRef.current = false;
      }, throttleMs);
    },
    [enabled, throttleMs]
  );

  // 设置左侧容器滚动监听
  useEffect(() => {
    const leftContainer = leftContainerRef.current;
    if (!leftContainer || !enabled) return;

    const handleLeftScroll = () => {
      syncLeftToRight(leftContainer.scrollTop);
    };

    leftContainer.addEventListener('scroll', handleLeftScroll, {
      passive: true,
    });
    return () => {
      leftContainer.removeEventListener('scroll', handleLeftScroll);
    };
  }, [enabled, syncLeftToRight]);

  // 设置右侧容器滚动监听
  useEffect(() => {
    const rightContainer = rightContainerRef.current;
    if (!rightContainer || !enabled) return;

    const handleRightScroll = () => {
      syncRightToLeft(rightContainer.scrollTop);
    };

    rightContainer.addEventListener('scroll', handleRightScroll, {
      passive: true,
    });
    return () => {
      rightContainer.removeEventListener('scroll', handleRightScroll);
    };
  }, [enabled, syncRightToLeft]);

  // 手动同步滚动位置
  const syncScrollPosition = useCallback(
    (scrollTop: number) => {
      if (!enabled) return;

      if (leftContainerRef.current) {
        leftContainerRef.current.scrollTop = scrollTop;
      }
      if (rightContainerRef.current) {
        rightContainerRef.current.scrollTop = scrollTop;
      }
    },
    [enabled]
  );

  return {
    leftContainerRef,
    rightContainerRef,
    syncScrollPosition,
  };
};
