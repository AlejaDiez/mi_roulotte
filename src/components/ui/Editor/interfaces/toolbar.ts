export interface ToolbarButton {
    type: "button";
    label?: (() => string) | string;
    icon?: (() => string) | string;
    variant?: () => "accent" | "destructive" | null;
    onClick: () => void;
}

export interface ToolbarInput {
    type: "input" | "switch";
    label?: (() => string) | string;
    value?: () => string | boolean;
    onChange: (value: string | boolean) => void;
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
