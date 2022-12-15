import { defaultDropAnimation, DragOverlay, DropAnimation, Modifier, useDndMonitor } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import classNames from "classnames";
import React, { HTMLAttributes, Ref, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";

export const DND_TYPE = "ROW" as const
export interface IRow {
    id: string
    render: () => JSX.Element | string | null
}

function Row_({ children, ...props }: HTMLAttributes<HTMLLIElement>, ref: Ref<HTMLLIElement>) {
    return (
        <li ref={ref} {...props}>
            <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50">
                {children}
            </div>
        </li>
    )
}
const Row = React.forwardRef(Row_)
function SortableRow({ id, row, ...rest }: React.HTMLAttributes<HTMLLIElement> & { id: string, row?: IRow }) {
    const { setNodeRef, listeners, transform, transition, attributes } = useSortable({
        id,
        data: {
            type: DND_TYPE,
            row,
            renderOverlay: () => <Row {...rest} className={classNames(rest.className, "!cursor-grabbing")} />
        }
    })
    return <Row
        ref={setNodeRef}
        {...rest}
        {...attributes}
        style={{ transition, transform: CSS.Translate.toString(transform) }}
        {...listeners}
    />
}

export default function SortableAnswerRows<TRow extends IRow>({ id, rows, onRowsChange }: { id: string, rows: TRow[], onRowsChange?: React.Dispatch<SetStateAction<TRow[]>> }) {
    const [active, setActive] = useState<null | { id: string, row: TRow }>(null)
    useDndMonitor({
        onDragStart({ active }) {
            console.debug("Received drag end event in SortableAnswerRows")
            const { row: activeRow, type: activeType, sortable: activeSortable } = active.data.current ?? {}
            const isActiveItemRow = activeType === DND_TYPE && activeRow
            const isActiveCurrentContainer = activeSortable.containerId === id
            if (isActiveItemRow && isActiveCurrentContainer) {
                setActive({ row: activeRow, id: active.id.toString() })
            }

        },
        onDragEnd({ active, over }) {
            console.debug("Received drag end event in SortableAnswerRows")
            const { row: activeRow, type: activeType, sortable: activeSortable } = active.data.current ?? {}
            const { type: overType, sortable: overSortable } = over?.data.current ?? {}
            const isActiveItemRow = activeType === DND_TYPE && activeRow
            const isActiveCurrentContainer = activeSortable.containerId === id
            const isHoveringOverRow = overType === DND_TYPE && over
            const isHoveringOverCurrentContainer = overSortable.containerId === id
            setActive(null)
            if (isActiveItemRow && isHoveringOverRow && onRowsChange && isActiveCurrentContainer && isHoveringOverCurrentContainer) {
                onRowsChange((prev) => {
                    const activeIndex = prev.findIndex(r => r.id === active.id)
                    const overIndex = prev.findIndex(r => r.id === over.id)
                    const newRows = [...prev]
                    newRows.splice(activeIndex, 1)
                    newRows.splice(overIndex, 0, activeRow as TRow)
                    return newRows
                })
            }
        }
    })

    return (
        <SortableContext id={id} items={rows} strategy={verticalListSortingStrategy}>
            <ul>
                {rows.map((row) => (
                    <SortableRow id={row.id} key={row.id} row={row} className={classNames("cursor-grab active:cursor-grabbing list-none", { "opacity-50 bg-opacity-50 cursor-grabbing": row.id === active?.id })}>
                        {row.render()}
                    </SortableRow>
                ))}
            </ul>
        </SortableContext>
    )
}