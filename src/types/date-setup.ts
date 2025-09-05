import { ViewMode } from './public-types';

export interface DateSetup {
  dates: number[]; // 时间戳数组（毫秒）
  viewMode: ViewMode;
}
