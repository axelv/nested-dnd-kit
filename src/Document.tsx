import { useDroppable } from '@dnd-kit/core';
import { CSS } from "@dnd-kit/utilities"
import classNames from 'classnames'
import React from 'react'
import DndManager from './DndManager'
import { IRow } from './SortableAnswerRows';
import { SortableQuestionTree } from './SortableQuestionTree'
import { IQuestionTree } from './types';
function createRow(label: string): { id: string; render: () => string } {
    return ({ id: label, render: () => label })
}
function createQuestion(question: string, children: IQuestionTree = [], rows: IRow[] = []) {
    return ({ id: question, render: () => question, children, rows })
}
const questionTree: IQuestionTree = [
    createQuestion("Home"),
    createQuestion(
        'Collections',
        [
            createQuestion('Spring', [], ["A", "B", "C"].map(createRow)),
            createQuestion('Summer', [], ["D", "E", "F"].map(createRow)),
            createQuestion('Fall', [], ["G", "H", "I"].map(createRow)),
            createQuestion('Winter'),
        ],
    ),
    createQuestion('About Us'),
    createQuestion('My Account',
        [
            createQuestion('Home'),
            createQuestion('Addresses'),
            createQuestion('Order History'),
        ],
    )
]

export default function Document({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const [questions, setQuestions] = React.useState(questionTree)
    const {
        setNodeRef,
    } = useDroppable({
        id: "canvas_droppable",
        data: {
            parent: null,
            isContainer: true
        }
    });

    return (
        <div
            ref={setNodeRef}
            className={classNames('mx-3 p-4 my-6 border border-gray-300 box-border bg-white shadow-sm', className)}
            {...props}
        >
            <DndManager>
                <SortableQuestionTree
                    questions={questions}
                    onQuestionsChange={setQuestions}
                    indicator
                    collapsible
                    removable
                />
            </DndManager>
        </div>
    )
}