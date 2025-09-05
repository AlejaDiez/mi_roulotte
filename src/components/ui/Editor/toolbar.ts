export class Toolbar {
    public readonly element: HTMLElement;

    constructor(
        private readonly elements: ToolbarElement[],
        private readonly position: { top: number; left: number }
    ) {
        this.element = document.createElement("div");
        this.build();
    }

    private buildButton(e: ToolbarButton) {
        const item = document.createElement("button");

        (e as any)["element"] = item;
        if (e.icon) {
            const icon = document.createElement("i");

            icon.className = `ibm-${typeof e.icon === "string" ? e.icon : e.icon()}`;
            item.appendChild(icon);
        }
        if (e.label) {
            const span = document.createElement("span");

            span.textContent =
                typeof e.label === "string" ? e.label : e.label();
            item.appendChild(span);
        }
        item.classList.add("button", `button-fill-${e.variant?.() ?? "muted"}`);
        item.onclick = () => {
            e.onClick();
            this.update();
        };
        return item;
    }

    private buildInput(e: ToolbarInput) {
        const item = document.createElement("input");

        (e as any)["element"] = item;
        item.type = "text";
        if (e.label) {
            item.placeholder =
                typeof e.label === "string" ? e.label : e.label();
        }
        if (e.value) {
            item.value = e.value().toString();
        }
        item.classList.add("input");
        item.onchange = ({ target }) => {
            e.onChange((target as any).value);
            this.update();
        };
        return item;
    }

    private buildSwitch(e: ToolbarInput) {
        const item = document.createElement("label");
        const input = document.createElement("input");

        (e as any)["element"] = item;
        if (e.label) {
            const span = document.createElement("span");

            span.textContent =
                typeof e.label === "string" ? e.label : e.label();
            item.appendChild(span);
        }
        input.type = "checkbox";
        if (e.value) {
            input.checked = e.value() as boolean;
        }
        input.classList.add("switch");
        input.onchange = ({ target }) => {
            e.onChange((target as any).checked);
            this.update();
        };
        item.appendChild(input);
        return item;
    }

    private buildGroup(e: ToolbarGroup) {
        const wrapper = document.createElement("div");
        const item = document.createElement("button");
        const items = document.createElement("div");

        // Create main item
        (e as any)["element"] = item;
        if (e.icon) {
            const icon = document.createElement("i");

            icon.className = `ibm-${typeof e.icon === "string" ? e.icon : e.icon()}`;
            item.appendChild(icon);
        }
        if (e.label) {
            const span = document.createElement("span");

            span.textContent =
                typeof e.label === "string" ? e.label : e.label();
            item.appendChild(span);
        }
        item.classList.add("button", `button-fill-${e.variant?.() ?? "muted"}`);
        if (e.onClick) {
            item.onclick = () => {
                e.onClick!();
                this.update();
            };
        }
        // Create the group items
        e.children.forEach((e) => items.appendChild(this.buildElement(e)));
        wrapper.appendChild(item);
        wrapper.appendChild(items);
        wrapper.classList.add("group");
        return wrapper;
    }

    private buildSeparator(e: ToolbarSeparator) {
        return document.createElement("hr");
    }

    private buildCustom(e: ToolbarCustom) {
        const rendered = e.render(() => this.update());

        (e as any)["element"] = rendered;
        return rendered;
    }

    private buildElement(e: ToolbarElement) {
        switch (e.type) {
            case "button":
                return this.buildButton(e);
            case "input":
                return this.buildInput(e);
            case "switch":
                return this.buildSwitch(e);
            case "group":
                return this.buildGroup(e);
            case "separator":
                return this.buildSeparator(e);
            case "custom":
                return this.buildCustom(e);
        }
    }

    private build() {
        this.elements.forEach((e) =>
            this.element.appendChild(this.buildElement(e))
        );
        this.element.style.top = `${this.position.top + window.scrollY}px`;
        this.element.style.left = `${this.position.left}px`;
        this.element.classList.add("toolbar");
    }

    private updateButton(e: ToolbarButton) {
        const item = (e as any).element as HTMLButtonElement;

        if (e.icon && typeof e.icon === "function") {
            const icon = item.querySelector("i")!;
            icon.className = `ibm-${e.icon()}`;
        }
        if (e.label && typeof e.label === "function") {
            const span = item.querySelector("span")!;
            span.textContent = e.label();
        }
        if (e.variant) {
            item.classList.remove(
                "button-fill-muted",
                "button-fill-accent",
                "button-fill-destructive"
            );
            item.classList.add(
                "button",
                `button-fill-${e.variant?.() ?? "muted"}`
            );
        }
    }

    private updateInput(e: ToolbarInput) {
        const item = (e as any).element as HTMLInputElement;

        if (e.label && typeof e.label === "function") {
            item.placeholder = e.label();
        }
        if (e.value) {
            item.value = e.value().toString();
        }
    }

    private updateSwitch(e: ToolbarInput) {
        const item = (e as any).element as HTMLLabelElement;
        const input = item.querySelector("input")!;

        if (e.label && typeof e.label === "function") {
            const span = item.querySelector("span")!;
            span.textContent = e.label();
        }
        if (e.value) {
            input.checked = e.value() as boolean;
        }
    }

    private updateGroup(e: ToolbarGroup) {
        const item = (e as any).element as HTMLButtonElement;

        if (e.icon && typeof e.icon === "function") {
            const icon = item.querySelector("i")!;
            icon.className = `ibm-${e.icon()}`;
        }
        if (e.label && typeof e.label === "function") {
            const span = item.querySelector("span")!;
            span.textContent = e.label();
        }
        if (e.variant) {
            item.classList.remove(
                "button-fill-muted",
                "button-fill-accent",
                "button-fill-destructive"
            );
            item.classList.add(
                "button",
                `button-fill-${e.variant?.() ?? "muted"}`
            );
        }
        e.children.forEach((e) => this.updateElement(e));
    }

    private updateCustom(e: ToolbarCustom) {
        e.update?.((e as any).element);
    }

    private updateElement(e: ToolbarElement) {
        switch (e.type) {
            case "button":
                this.updateButton(e);
                break;
            case "input":
                this.updateInput(e);
                break;
            case "switch":
                this.updateSwitch(e);
                break;
            case "group":
                this.updateGroup(e);
                break;
            case "custom":
                this.updateCustom(e);
                break;
        }
    }

    private update() {
        this.elements.forEach((e) => this.updateElement(e));
    }
}

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
