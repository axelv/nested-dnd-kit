import { DndContext, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { useAutoAnimate } from '@formkit/auto-animate/react'
import React from "react"

function LibraryItem({ label }: { label: string }) {
    const { setNodeRef, listeners, attributes, transform } = useDraggable({ id: label, data: { label } })
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{ transform: CSS.Transform.toString(transform) }}
            className="rounded border border-gray-200 shadow-sm px-3 py-2 text-gray-700 bg-white">
            {label}
        </div>
    )
}

export default function Library() {
    const [parent, enableAnimations] = useAutoAnimate<HTMLDivElement>()
    return (
        <div className='w-96'>
            <div className='p-4'>
                <h2 className='text-2xl font-bold text-gray-700'>
                    Library
                </h2>
            </div>
            <div ref={parent} className='flex flex-col px-2 space-y-1'>
                <LibraryItem label="Item A" />
                <LibraryItem label="Item B" />
                <LibraryItem label="Item C" />
            </div>
        </div>
    )
}

export const LibraryDnDContext = ({ children }: React.PropsWithChildren<{}>) => {
    return (
        <DndContext>
            {children}
        </DndContext>
    )
}