import type { Editor } from "../editor";

export abstract class Block extends HTMLElement {
    private mounted = false;
    protected editor!: Editor;
    protected element!: HTMLElement;

    abstract get type(): string;
    protected abstract render(): HTMLElement;
    abstract load(params: { style?: any; data?: any | any[] }): void;
    abstract save(): {
        style?: any;
        data?: any | any[];
    };

    toolbar(): any | null {
        return null;
    }

    destroy(): void {
        this.remove();
    }

    connectedCallback() {
        if (this.mounted) {
            return;
        } else {
            this.mounted = true;
            this.editor = this.closest("block-editor") as Editor;
        }

        const controlsLeft = document.createElement("div");
        const controlsRight = document.createElement("div");

        // Remove button
        const removeButton = document.createElement("button");
        const removeIcon = document.createElement("i");

        removeIcon.classList.add("ibm-trash-can");
        removeButton.appendChild(removeIcon);
        removeButton.classList.add("remove", "button", "button-destructive");
        removeButton.onclick = () => this.editor!.removeBlock(this);
        controlsLeft.appendChild(removeButton);

        // Drag button
        const dragButton = document.createElement("button");
        const dragIcon = document.createElement("i");

        dragIcon.classList.add("ibm-draggable");
        dragButton.appendChild(dragIcon);
        dragButton.classList.add("draggable", "button", "button-muted");
        controlsLeft.appendChild(dragButton);

        // Add button
        const addButton = document.createElement("button");
        const addIcon = document.createElement("i");

        addIcon.classList.add("ibm-add");
        addButton.appendChild(addIcon);
        addButton.classList.add("add", "button", "button-primary");
        addButton.onclick = () =>
            this.editor!.addBlock("paragraph", undefined, this);
        controlsRight.appendChild(addButton);

        // Left controls
        controlsLeft.appendChild(removeButton);
        controlsLeft.appendChild(dragButton);
        controlsLeft.classList.add("controls");
        this.appendChild(controlsLeft);

        // Wrapper
        this.element = this.render();
        this.element.classList.add("content");
        this.appendChild(this.element);

        // Right controls
        controlsRight.appendChild(addButton);
        controlsRight.classList.add("controls");
        this.appendChild(controlsRight);

        this.classList.add("block");
    }
}
