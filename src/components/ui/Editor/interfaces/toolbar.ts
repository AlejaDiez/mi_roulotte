export interface ToolbarButton {
    type: "button";
    label?: (() => string) | string;
    icon?: (() => string) | string;
    variant?: () => "accent" | "destructive" | null;
    onClick: () => void;
}

export interface ToolbarInput {
    type: "text" | "number" | "switch";
    label?: (() => string) | string;
    value?: () => string | number | boolean | null;
    onChange: (value: string | number | boolean | null) => void;
}

export interface ToolbarGroup {
    type: "group";
    label?: (() => string) | string;
    icon?: (() => string) | string;
    variant?: () => "accent" | "destructive" | null;
    onClick?: () => void;
    children: ToolbarElement[];
}

export interface ToolbarSeparator {
    type: "separator";
}

export interface ToolbarCustom {
    type: "custom";
    render: (update: () => void) => HTMLElement;
    update?: (self: HTMLElement) => void;
}

export type ToolbarElement =
    | ToolbarButton
    | ToolbarInput
    | ToolbarGroup
    | ToolbarSeparator
    | ToolbarCustom;
