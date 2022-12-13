import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { create, string } from 'superstruct';

import type { FlattenedItem, TreeItem, TreeItems } from './types';

export const iOS = /iPad|iPhone|iPod/.test(navigator.platform);

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: FlattenedItem[],
  activePathString: string,
  overPathString: string,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ path }) => JSON.stringify(path) === overPathString);
  const activeItemIndex = items.findIndex(({ path }) => JSON.stringify(path) === activePathString);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }
  return { depth, maxDepth, minDepth, parentPathString: getParentPathString() };

  function getParentPathString() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentPathString;
    }

    if (depth > previousItem.depth) {
      return previousItem.pathString;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentPathString;

    return newParent ?? null;
  }
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten(
  items: TreeItems,
  parentPathString: string | null = null,
  depth = 0,
  path: string[] = []
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    const newPath = [...path, create(item.id, string())]
    const pathString = JSON.stringify(newPath)
    return [
      ...acc,
      { ...item, parentPathString, depth, index, path: newPath, pathString },
      ...flatten(item.children, pathString, depth + 1, newPath),
    ];
  }, []);
}

export function flattenTree(items: TreeItems): FlattenedItem[] {
  return flatten(items);
}

export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
  const root: TreeItem = { id: 'root', children: [] };
  const rootPathString = JSON.stringify([root.id]);
  const nodes: Record<string, TreeItem> = { [rootPathString]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, pathString, children } = item;
    const parentPathString = item.parentPathString ?? rootPathString;
    const parent = nodes[parentPathString] ?? findItem(items, parentPathString);

    nodes[pathString] = { id, children };
    parent.children.push(item);
  }

  return root.children;
}

export function findItem(items: TreeItem[], itemId: UniqueIdentifier) {
  return items.find(({ id }) => id === itemId);
}

export function findItemDeep(
  items: TreeItems,
  path: UniqueIdentifier[]
): TreeItem | undefined {
  for (const item of items) {
    const { id, children } = item;
    if (id === path[0]) {
      if (path.length > 1) {
        return findItemDeep(children, path.slice(1));
      }
      return item;
    }
  }

  return undefined;
}

export function removeItem(items: TreeItems, id: UniqueIdentifier) {
  const newItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}

export function setProperty<T extends keyof TreeItem>(
  items: TreeItems,
  id: UniqueIdentifier,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T]
) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

function countChildren(items: TreeItem[], count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount(items: TreeItems, path: UniqueIdentifier[]) {
  const item = findItemDeep(items, path);

  return item ? countChildren(item.children) : 0;
}

export function removeChildrenOf(
  items: FlattenedItem[],
  pathStrings: string[]
) {
  const excludeParentPathStrings = [...pathStrings];

  return items.filter((item) => {
    if (item.parentPathString && excludeParentPathStrings.includes(item.parentPathString)) {
      if (item.children.length) {
        excludeParentPathStrings.push(item.pathString);
      }
      return false;
    }

    return true;
  });
}
