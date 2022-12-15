import { Story } from "@storybook/react"
import { DndContext } from "@dnd-kit/core"
import SortableAnswerRows from "../SortableAnswerRows"
import React from "react"

export default {
    component: SortableAnswerRows
}

const ROWS = [{ id: "A" }, { id: "B" }, { id: "C" }].map(r => ({ ...r, render: () => r.id }))
type StoryArgs = { rows: typeof ROWS }
export const Rows: Story<StoryArgs> = (args) => {
    const [rows, setRows] = React.useState(args.rows)
    return (
        <DndContext>
            <SortableAnswerRows
                id="rows"
                rows={rows}
                onRowsChange={setRows}
            />
        </DndContext >
    )
}
Rows.args = {
    rows: ROWS
}