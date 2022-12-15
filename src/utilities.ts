import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { create, string } from 'superstruct';

import type { IFlattenedQuestion, IQuestionItem, IQuestionTree } from './types';

export const iOS = /iPad|iPhone|iPod/.test(navigator.platform);

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: IFlattenedQuestion[],
  activePathString: string,
  overPathString: string,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ pathString }) => pathString === overPathString);
  const activeItemIndex = items.findIndex(({ pathString }) => pathString === activePathString);
  const activeItem = items[activeItemIndex];
  // check for path collision with active item
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
  return { depth, maxDepth, minDepth, parentPathString: getParentPathString(), allowed: getAllowed() };

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
  function getAllowed() {
    return items.filter(item => item.id === activeItem.id && item.parentPathString === getParentPathString() && item.parentPathString !== activeItem.parentPathString).length == 0
  }
}

function getMaxDepth({ previousItem }: { previousItem: IFlattenedQuestion }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({ nextItem }: { nextItem: IFlattenedQuestion }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten(
  items: IQuestionTree,
  parentPathString: string | null = null,
  depth = 0,
  path: string[] = []
): IFlattenedQuestion[] {
  return items.reduce<IFlattenedQuestion[]>((acc, item, index) => {
    const newPath = [...path, create(item.id, string())]
    const pathString = JSON.stringify(newPath)
    return [
      ...acc,
      { ...item, parentPathString, depth, index, path: newPath, pathString },
      ...flatten(item.children, pathString, depth + 1, newPath),
    ];
  }, []);
}

export function flattenTree(items: IQuestionTree): IFlattenedQuestion[] {
  return flatten(items);
}

export function buildTree(flattenedItems: IFlattenedQuestion[]): IQuestionTree {
  const root: IQuestionItem = { id: 'root', children: [], render: () => "root" };
  const rootPathString = JSON.stringify([root.id]);
  const nodes: Record<string, IQuestionItem> = { [rootPathString]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, pathString, children, rows, render } = item;
    const parentPathString = item.parentPathString ?? rootPathString;
    const parent = nodes[parentPathString] ?? items.find(({ pathString }) => pathString === parentPathString);

    nodes[pathString] = { id, children, render, rows };
    parent.children.push(item);
  }

  return root.children;
}


export function findItemDeep(
  items: IQuestionTree,
  path: UniqueIdentifier[]
): IQuestionItem | undefined {
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

export function removeItem(items: IQuestionTree, path: string[]) {
  const newItems = [];
  if (path.length == 0) return []
  for (const item of items) {
    if (item.id === path[0]) {
      if (path.length == 1) {
        continue
      }
      item.children = removeItem(item.children, path.slice(1))
    }
    newItems.push(item);
  }

  return newItems;
}

export function setProperty<T extends keyof IQuestionItem>(
  items: IQuestionTree,
  path: string[],
  property: T,
  setter: (value: IQuestionItem[T]) => IQuestionItem[T]
) {
  if (path.length == 0) return items
  for (const item of items) {
    if (item.id === path[0]) {
      if (path.length > 1) {
        item.children = setProperty(item.children, path.slice(1), property, setter);
      }
      item[property] = setter(item[property]);
      break
    }
  }

  return [...items];
}

function countChildren(items: IQuestionItem[], count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount(items: IQuestionTree, path: UniqueIdentifier[]) {
  const item = findItemDeep(items, path);

  return item ? countChildren(item.children) : 0;
}

export function removeChildrenOf(
  items: IFlattenedQuestion[],
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
