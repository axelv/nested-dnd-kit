import { closestCenter, DndContext, MeasuringStrategy, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import React from "react";

const measuring = {
    droppable: {
        strategy: MeasuringStrategy.Always,
    },
};

function DndManager({ children }: React.PropsWithChildren<{}>) {
    const sensors = useSensors(useSensor(PointerSensor));
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={measuring}
        >
            {children}
        </DndContext>
    )
}

export default DndManager;