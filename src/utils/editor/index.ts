import Sortable from "sortablejs";
import HeadingBlock from "./blocks/heading";
import ParagraphBlock from "./blocks/paragraph";

// Editor
export type BlockConstructor = new (params: {
    style?: Record<string, any>;
    data?: Record<string, any> | Record<string, any>[];
}) => Block;

export interface Block {
    destroy?: () => void;
    render: () => HTMLElement;
    toolbar?: () => Toolbar;
    style: (el: HTMLElement) => any;
    data: (el: HTMLElement) => any;
}

export { HeadingBlock, ParagraphBlock };

export class Editor {
    private blocks: { type: string; block: Block; element: HTMLElement }[] = [];
    private toolbar: {
        manager: HTMLElement;
        toolbar: Toolbar;
        element: HTMLElement;
    } | null = null;

    constructor(
        private readonly holder: HTMLElement,
        public readonly tools: { [key: string]: BlockConstructor },
        data: any[] = []
    ) {
        // Sortable
        new Sortable(holder.querySelector(".blocks")!, {
            handle: ".draggable",
            direction: "vertical",
            chosenClass: "dragging",
            ghostClass: "ghost-dragged",
            animation: 150,
            onStart: () => this.hideToolbar(),
            onEnd: ({ oldIndex, newIndex }) =>
                this.blocks.splice(
                    newIndex!,
                    0,
                    this.blocks.splice(oldIndex!, 1)[0]
                )
        });
        // Hide toolbar
        document.addEventListener("click", ({ target }) => {
            if (!this.toolbar?.element.contains(target as Node)) {
                this.hideToolbar();
            }
        });
        // Read data
        data.forEach(({ type, style, data }) =>
            this.addBlock(type, style, data)
        );
    }

    // Content
    save() {
        return this.blocks.map((b) => ({
            type: b.type,
            style: b.block.style(b.element),
            data: b.block.data(b.element)
        }));
    }

    export() {
        return JSON.stringify(this.save());
    }

    // Blocks
    private renderBlock(element: HTMLElement) {
        // Left controls
        const controlsLeft = document.createElement("div");
        const removeButton = document.createElement("button");
        const dragButton = document.createElement("button");

        removeButton.classList.add("remove", "button", "button-destructive");
        removeButton.innerHTML = "<i class='ibm-trash-can'></i>";
        removeButton.onclick = () => this.removeBlock(element);
        dragButton.classList.add("draggable", "button", "button-muted");
        dragButton.innerHTML = "<i class='ibm-draggable'></i>";
        controlsLeft.classList.add("controls");
        controlsLeft.appendChild(removeButton);
        controlsLeft.appendChild(dragButton);

        // Block component
        const component = document.createElement("div");

        component.classList.add("component");
        component.appendChild(element);

        // Right controls
        const controlsRight = document.createElement("div");
        const addButton = document.createElement("button");

        addButton.classList.add("add", "button", "button-primary");
        addButton.innerHTML = "<i class='ibm-add'></i>";
        addButton.onclick = () => {
            // TODO
            this.addBlockAfter("paragraph", undefined, undefined, element);
        };
        controlsRight.classList.add("controls");
        controlsRight.appendChild(addButton);

        // Wrapper
        const wrapper = document.createElement("div");

        wrapper.classList.add("block");
        wrapper.appendChild(controlsLeft);
        wrapper.appendChild(component);
        wrapper.appendChild(controlsRight);
        return wrapper;
    }

    private addBlockAfter(
        type: string,
        style?: any,
        data?: any,
        reference?: HTMLElement
    ) {
        // Generate the block
        const block = new this.tools[type]({ style, data });

        // Render the block
        const rendered = block.render();

        rendered.addEventListener("click", (ev) => {
            ev.stopPropagation();
            if (!block.toolbar) {
                return;
            }
            if (!this.toolbar || this.toolbar.manager !== rendered) {
                this.injectToolbar(rendered, block.toolbar());
            }
            this.showToolbar();
        });
        rendered.addEventListener("input", () => this.hideToolbar());

        // Insert the block
        const blockList = this.holder.querySelector(".blocks")!;
        const index = reference
            ? this.blocks.findIndex(({ element }) => element === reference) + 1
            : this.blocks.length;

        this.blocks.splice(index, 0, { type, block, element: rendered });
        if (blockList.children[index]) {
            blockList.insertBefore(
                this.renderBlock(rendered),
                blockList.children[index]
            );
        } else {
            blockList.appendChild(this.renderBlock(rendered));
        }
    }

    addBlock(type: string, style?: any, data?: any) {
        this.addBlockAfter(type, style, data);
    }

    removeBlock(element: HTMLElement) {
        // Finde the block
        const index = this.blocks.findIndex((b) => b.element === element);

        if (index === -1) {
            return;
        }

        // Remove the block
        const block = this.blocks.splice(index, 1)[0];

        block.element.closest(".block")!.remove();
        block.block.destroy?.();
    }

    // Toolbar
    private renderToolbar(element: HTMLElement, toolbar: Toolbar) {
        const buildElement = (e: ToolbarElement) => {
            const buildButton = (e: ToolbarButton) => {
                const item = document.createElement("button");

                (e as any)["element"] = item;
                if (e.icon) {
                    const icon = document.createElement("i");

                    icon.className = `ibm-${typeof e.icon === "string" ? e.icon : e.icon(element)}`;
                    item.appendChild(icon);
                }
                if (e.label) {
                    const span = document.createElement("span");

                    span.textContent =
                        typeof e.label === "string"
                            ? e.label
                            : e.label(element);
                    item.appendChild(span);
                }
                item.classList.add(
                    "button",
                    `button-fill-${e.variant?.(element) ?? "muted"}`
                );
                item.onclick = () => {
                    e.onClick(element);
                    this.updateToolbar();
                };
                return item;
            };
            const buildInput = (e: ToolbarInput) => {
                const item = document.createElement("input");

                (e as any)["element"] = item;
                item.type = "text";
                if (e.label) {
                    item.placeholder =
                        typeof e.label === "string"
                            ? e.label
                            : e.label(element);
                }
                if (e.value) {
                    item.value = e.value(element).toString();
                }
                item.classList.add("input");
                item.onchange = ({ target }) => {
                    e.onChange((target as any).value, element);
                    this.updateToolbar();
                };
                return item;
            };
            const buildSwitch = (e: ToolbarInput) => {
                const item = document.createElement("label");
                const input = document.createElement("input");

                (e as any)["element"] = item;
                if (e.label) {
                    const span = document.createElement("span");

                    span.textContent =
                        typeof e.label === "string"
                            ? e.label
                            : e.label(element);
                    item.appendChild(span);
                }
                input.type = "checkbox";
                if (e.value) {
                    input.checked = e.value(element) as boolean;
                }
                input.classList.add("switch");
                input.onchange = ({ target }) => {
                    e.onChange((target as any).checked, element);
                    this.updateToolbar();
                };
                item.appendChild(input);
                return item;
            };
            const buildGroup = (e: ToolbarGroup) => {
                const wrapper = document.createElement("div");
                const item = document.createElement("button");
                const items = document.createElement("div");

                // Create main item
                (e as any)["element"] = item;
                if (e.icon) {
                    const icon = document.createElement("i");

                    icon.className = `ibm-${typeof e.icon === "string" ? e.icon : e.icon(element)}`;
                    item.appendChild(icon);
                }
                if (e.label) {
                    const span = document.createElement("span");

                    span.textContent =
                        typeof e.label === "string"
                            ? e.label
                            : e.label(element);
                    item.appendChild(span);
                }
                item.classList.add(
                    "button",
                    `button-fill-${e.variant?.(element) ?? "muted"}`
                );
                if (e.onClick) {
                    item.onclick = () => {
                        e.onClick!(element);
                        this.updateToolbar();
                    };
                }
                // Create the group items
                e.children.forEach((e) => items.appendChild(buildElement(e)));
                wrapper.appendChild(item);
                wrapper.appendChild(items);
                wrapper.classList.add("group");
                return wrapper;
            };
            const buildSeparator = (e: ToolbarSeparator) => {
                return document.createElement("hr");
            };
            const buildCustom = (e: ToolbarCustom) => {
                const rendered = e.render(element, () => this.updateToolbar());

                (e as any)["element"] = rendered;
                return rendered;
            };

            switch (e.type) {
                case "button":
                    return buildButton(e);
                case "input":
                    return buildInput(e);
                case "switch":
                    return buildSwitch(e);
                case "group":
                    return buildGroup(e);
                case "separator":
                    return buildSeparator(e);
                case "custom":
                    return buildCustom(e);
            }
        };

        // Wrapper
        const wrapper = document.createElement("div");

        toolbar.children.forEach((e) => wrapper.appendChild(buildElement(e)));
        wrapper.style.display = "none";
        wrapper.classList.add("toolbar");
        return wrapper;
    }

    private injectToolbar(element: HTMLElement, toolbar: Toolbar) {
        const rendered = this.renderToolbar(element, toolbar);

        this.destroyToolbar();
        this.toolbar = {
            manager: element,
            toolbar,
            element: rendered
        };
        this.holder.appendChild(rendered);
    }

    private destroyToolbar() {
        if (this.toolbar) {
            this.holder.removeChild(this.toolbar.element);
            this.toolbar = null;
        }
    }

    private updateToolbar() {
        const updateElement = (e: ToolbarElement) => {
            const updateButton = (e: ToolbarButton) => {
                const item = (e as any).element as HTMLButtonElement;

                if (e.icon && typeof e.icon === "function") {
                    const icon = item.querySelector("i")!;

                    icon.className = `ibm-${e.icon(this.toolbar!.manager)}`;
                }
                if (e.label && typeof e.label === "function") {
                    const span = item.querySelector("span")!;

                    span.textContent = e.label(this.toolbar!.manager);
                }
                if (e.variant) {
                    item.classList.remove(
                        "button-fill-muted",
                        "button-fill-accent",
                        "button-fill-destructive"
                    );
                    item.classList.add(
                        "button",
                        `button-fill-${e.variant?.(this.toolbar!.manager) ?? "muted"}`
                    );
                }
            };
            const updateInput = (e: ToolbarInput) => {
                const item = (e as any).element as HTMLInputElement;

                if (e.label && typeof e.label === "function") {
                    item.placeholder = e.label(this.toolbar!.manager);
                }
                if (e.value) {
                    item.value = e.value(this.toolbar!.manager).toString();
                }
            };
            const updateSwitch = (e: ToolbarInput) => {
                const item = (e as any).element as HTMLLabelElement;
                const input = item.querySelector("input")!;

                if (e.label && typeof e.label === "function") {
                    const span = item.querySelector("span")!;

                    span.textContent = e.label(this.toolbar!.manager);
                }
                if (e.value) {
                    input.checked = e.value(this.toolbar!.manager) as boolean;
                }
            };
            const updateGroup = (e: ToolbarGroup) => {
                const item = (e as any).element as HTMLButtonElement;

                if (e.icon && typeof e.icon === "function") {
                    const icon = item.querySelector("i")!;

                    icon.className = `ibm-${e.icon(this.toolbar!.manager)}`;
                }
                if (e.label && typeof e.label === "function") {
                    const span = item.querySelector("span")!;

                    span.textContent = e.label(this.toolbar!.manager);
                }
                if (e.variant) {
                    item.classList.remove(
                        "button-fill-muted",
                        "button-fill-accent",
                        "button-fill-destructive"
                    );
                    item.classList.add(
                        "button",
                        `button-fill-${e.variant?.(this.toolbar!.manager) ?? "muted"}`
                    );
                }
                // Update items
                e.children.forEach(updateElement);
            };
            const updateCustom = (e: ToolbarCustom) => {
                e.update?.(this.toolbar!.manager, (e as any).element);
            };

            switch (e.type) {
                case "button":
                    updateButton(e);
                    break;
                case "input":
                    updateInput(e);
                    break;
                case "switch":
                    updateSwitch(e);
                    break;
                case "group":
                    updateGroup(e);
                    break;
                case "custom":
                    updateCustom(e);
                    break;
            }
        };

        if (this.toolbar) {
            this.toolbar.toolbar.children.forEach(updateElement);
        }
    }

    showToolbar() {
        if (this.toolbar) {
            // Get position
            const pos = this.toolbar.toolbar.position(this.toolbar.manager);

            if (!pos) {
                return this.hideToolbar();
            }

            // Update toolbar
            this.updateToolbar();
            this.toolbar.element.style.left = `${pos.left + window.scrollX}px`;
            this.toolbar.element.style.top = `${pos.top + window.scrollY}px`;
            this.toolbar.element.style.display = "";
        }
    }

    hideToolbar() {
        if (this.toolbar) {
            this.toolbar.element.style.display = "none";
        }
    }
}

// Toolbar
export interface ToolbarButton {
    type: "button";
    label?: ((el: HTMLElement) => string) | string;
    icon?: ((el: HTMLElement) => string) | string;
    variant?: (el: HTMLElement) => "accent" | "destructive" | null;
    onClick: (el: HTMLElement) => void;
}

export interface ToolbarInput {
    type: "input" | "switch";
    label?: ((el: HTMLElement) => string) | string;
    value?: (el: HTMLElement) => string | boolean;
    onChange: (value: string | boolean, el: HTMLElement) => void;
}

export interface ToolbarGroup {
    type: "group";
    label?: ((el: HTMLElement) => string) | string;
    icon?: ((el: HTMLElement) => string) | string;
    variant?: (el: HTMLElement) => "accent" | "destructive" | null;
    onClick?: (el: HTMLElement) => void;
    children: ToolbarElement[];
}

export interface ToolbarSeparator {
    type: "separator";
}

export interface ToolbarCustom {
    type: "custom";
    render: (el: HTMLElement, update: () => void) => HTMLElement;
    update?: (el: HTMLElement, self: HTMLElement) => void;
}

export type ToolbarElement =
    | ToolbarButton
    | ToolbarInput
    | ToolbarGroup
    | ToolbarSeparator
    | ToolbarCustom;

export interface Toolbar {
    children: ToolbarElement[];
    position: (el: HTMLElement) => { top: number; left: number } | null;
}
