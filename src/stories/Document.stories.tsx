import { Meta, Story } from "@storybook/react"
import Document from "../Document";

export default {
    component: Document,
    parameters: {
        layout: 'fullscreen'
    }
} as Meta

export const Default: Story = () => <Document />;
