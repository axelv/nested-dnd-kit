import { Story } from "@storybook/react"
import { SortableTree, Props } from "../SortableTree";

export default {
    component: SortableTree
}

export const Default: Story = (args) => <SortableTree {...args} />;


export const NonUnique: Story = (args) => <SortableTree {...args} />;
NonUnique.args = {
    defaultItems: [
        {
            id: 'Home',
            children: [],
        },
        {
            id: 'Collections',
            children: [
                { id: 'Spring', children: [], },
                { id: 'Summer', children: [], },
                { id: 'Fall', children: [], },
                { id: 'Winter', children: [], },
                { id: "Home", children: [], },
            ],
        },
        {
            id: 'About Us',
            children: [],
        },
        {
            id: 'My Account',
            children: [
                { id: 'Addresses', children: [] },
                { id: 'Order History', children: [], },
            ],
        },
    ]
}