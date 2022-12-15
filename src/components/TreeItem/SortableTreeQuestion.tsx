import React, { CSSProperties } from 'react';
import type { UniqueIdentifier, Data } from '@dnd-kit/core';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { TreeItem, Props as TreeItemProps } from './TreeItem';
import { iOS } from '../../utilities';
import classNames from 'classnames';

export const DND_TYPE = "QUESTION" as const;
export interface IQuestion {
  id: string;
  render: () => React.ReactNode;
}
interface Props extends TreeItemProps {
  id: UniqueIdentifier;
  question?: IQuestion;
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  isSorting || wasDragging ? false : true;

export function SortableTreeQuestion({ id, question, depth, ...props }: Props) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: {
      type: DND_TYPE,
      question,
      renderOverlay: () => <TreeItem
        className={classNames(props.className, '!cursor-grabbing list-none')}
        depth={depth}
        clone
        disableSelection={iOS}
        disableInteraction={isSorting}
        {...props}
      />
    },
    animateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  );
}
