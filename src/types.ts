import type { MutableRefObject } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';

export interface TreeItem {
  id: UniqueIdentifier;
  children: TreeItem[];
  collapsed?: boolean;
  items?: []
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentPathString: string | null
  depth: number;
  index: number;
  path: UniqueIdentifier[];
  pathString: string;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
