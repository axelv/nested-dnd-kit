import type { MutableRefObject } from 'react';
import { IQuestion } from './components/TreeItem/SortableTreeQuestion';
import { IRow } from './SortableAnswerRows';

export interface IQuestionItem extends IQuestion {
  id: string;
  children: IQuestionItem[];
  collapsed?: boolean;
  rows?: IRow[]
}

export type IQuestionTree = IQuestionItem[];

export interface IFlattenedQuestion extends IQuestionItem {
  parentPathString: string | null
  depth: number;
  index: number;
  path: string[];
  pathString: string;
}

export type SensorContext = MutableRefObject<{
  items: IFlattenedQuestion[];
  offset: number;
}>;
