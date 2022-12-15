import React, { SetStateAction, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  DropAnimation,
  Modifier,
  defaultDropAnimation,
  useDndMonitor,
  Active,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty,
} from './utilities';
import type { IFlattenedQuestion, IQuestionItem, IQuestionTree } from './types';
import { SortableTreeQuestion, TreeItem } from './components';
import { CSS } from '@dnd-kit/utilities';
import { create, func, is, optional, string } from 'superstruct';
import SortableAnswerRows, { IRow } from './SortableAnswerRows';
import { DND_TYPE as DND_QUESTION_TYPE } from './components/TreeItem/SortableTreeQuestion';
import _ from 'lodash';


const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

function updateQuestionTree(
  questions: IQuestionTree,
  path: string[],
  action: SetStateAction<IQuestionItem>
): IQuestionTree {
  return questions.map((question) => {
    // we are not in the right branch
    if (question.id !== path[0]) {
      return question
    }
    // we are in the right branch and we are at the end of the path
    if (path.length === 1) {
      return is(action, func()) ? action(question) : action
    }
    // we are in the right branch but we are not at the end of the path
    return {
      ...question,
      children: updateQuestionTree(question.children, path.slice(1), action),
    };
  });
}

function createQuestionRowUpdater(path: string[], handleQuestionsChange: React.Dispatch<SetStateAction<IQuestionTree>>): React.Dispatch<SetStateAction<IRow[]>> {
  return (action: SetStateAction<IRow[]>) => handleQuestionsChange(
    questions => updateQuestionTree(questions, path,
      question => ({ ...question, rows: is(action, func()) ? action(question.rows ?? []) : action })
    ));
}

export interface SortableQuestionTreeProps {

  collapsible?: boolean;
  questions?: IQuestionTree;
  onQuestionsChange?: React.Dispatch<React.SetStateAction<IQuestionTree>>;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}

export function SortableQuestionTree({
  collapsible,
  questions = [],
  onQuestionsChange,
  indicator = false,
  indentationWidth = 50,
  removable,
}: SortableQuestionTreeProps) {
  const [active, setActive] = useState<Active | null>(null);
  const [activePathString, setActivePathString] = useState<string | null>(null);
  const [overPathString, setOverPathString] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const flattenedQuestions = useMemo(() => {
    const flattenedTree = flattenTree(questions);
    const collapsedItemPathStrings = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, pathString }) =>
        collapsed && children.length ? [...acc, pathString] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activePathString ? [activePathString, ...collapsedItemPathStrings] : collapsedItemPathStrings
    );
  }, [activePathString, questions]);

  const projected =
    activePathString && overPathString
      ? getProjection(
        flattenedQuestions,
        activePathString,
        overPathString,
        offsetLeft,
        indentationWidth
      )
      : null;


  const sortedIds = useMemo(() => flattenedQuestions.map(({ pathString }) => pathString), [flattenedQuestions,]);
  const activeQuestion = activePathString ? flattenedQuestions.find(({ pathString }) => pathString === activePathString) : null;

  useDndMonitor({
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel
  })

  return (
    <SortableContext id="question-tree" items={sortedIds} strategy={verticalListSortingStrategy}>
      {flattenedQuestions.map(({ pathString, id, children, collapsed, depth, path, rows = [] }) => (
        <SortableTreeQuestion
          key={pathString}
          id={pathString}
          childCount={getChildCount(questions, path)}
          allowDrop={projected?.allowed}
          value={id.toString()}
          depth={pathString === activePathString && projected ? projected.depth : depth}
          indentationWidth={indentationWidth}
          indicator={indicator}
          collapsed={Boolean(collapsed && children.length)}
          onCollapse={
            collapsible && children.length
              ? () => handleCollapse(path)
              : undefined
          }
          onRemove={removable ? () => handleRemove(path) : undefined}
        >
          <SortableAnswerRows
            id={pathString}
            rows={rows}
            onRowsChange={onQuestionsChange && createQuestionRowUpdater(path, onQuestionsChange)}
          />
        </SortableTreeQuestion>
      ))}
      {createPortal(
        <DragOverlay
          dropAnimation={dropAnimationConfig}
          modifiers={indicator && active?.data.current?.type == DND_QUESTION_TYPE ? [adjustTranslate] : undefined}
        >
          {active ? active.data.current?.renderOverlay() ?? null : null}
        </DragOverlay>,
        document.body
      )}
    </SortableContext>
  );

  function handleDragStart({ active }: DragStartEvent) {
    const { id, data } = active;
    setActive(active)
    const { type, question } = data.current ?? {}
    if (type !== DND_QUESTION_TYPE) return;
    console.debug("Received drag start event in SortableQuestionTree")
    const activePathString = create(id, string());
    setActivePathString(create(activePathString, string()));
    setOverPathString(create(activePathString, string()));

    const activeQuestion = flattenedQuestions.find(({ pathString }) => pathString === activePathString);

    console.debug("Active item: " + activeQuestion)
  }

  function handleDragMove({ delta, active: { data } }: DragMoveEvent) {
    const { type, question } = data.current ?? {}
    if (type !== DND_QUESTION_TYPE) return;
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over, active: { data } }: DragOverEvent) {
    const { type, question } = data.current ?? {}
    if (type !== DND_QUESTION_TYPE) return;
    setOverPathString(create(over?.id, optional(string())) ?? null);
  }

  function handleDragEnd({ active: { data, id: activeId }, over }: DragEndEvent) {
    resetState();
    const { type, question } = data.current ?? {}
    if (type !== DND_QUESTION_TYPE) return;
    if (!onQuestionsChange) return;

    if (projected && over) {
      const { depth, parentPathString, allowed } = projected;
      if (!allowed) {
        console.warn("Can't move item to level " + depth + " because it already exists there.")
        return
      };
      const clonedItems: IFlattenedQuestion[] = _.cloneDeep(flattenTree(questions))

      const overPathString = create(over.id, string());
      const activePathString = create(activeId, string());
      const overIndex = clonedItems.findIndex(({ pathString }) => pathString === overPathString);
      const activeIndex = clonedItems.findIndex(({ pathString }) => pathString === activePathString);
      const activeTreeItem = clonedItems[activeIndex];
      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentPathString };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);

      onQuestionsChange(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setActive(null)
    setOverPathString(null);
    setActivePathString(null);
    setOffsetLeft(0);

    document.body.style.setProperty('cursor', '');
  }

  function handleRemove(path: string[]) {
    if (!onQuestionsChange) return;
    onQuestionsChange((questions) => removeItem(questions, path));
  }

  function handleCollapse(path: string[]) {
    if (!onQuestionsChange) return;
    onQuestionsChange((items) =>
      setProperty(items, path, 'collapsed', (value) => {
        return !value;
      })
    );
  }


}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
