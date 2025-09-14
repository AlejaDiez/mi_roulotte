import type { MosaicBlock } from "../components/mosaic_block";
import type { Editor } from "./editor";

export type BlockType = "heading" | "paragraph" | "image" | "video" | "mosaic";

export abstract class Block extends HTMLElement {
    private mounted = false;
    protected editor!: Editor;
    protected mosaic!: MosaicBlock | null;
    protected element!: HTMLElement;

    abstract get type(): BlockType;
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
            this.editor = this.closest("block-editor") as any;
            this.mosaic = this.parentElement?.closest("mosaic-block") ?? null;
        }

        // Block
        this.classList.add("block");

        // Left controls
        if (this.mosaic === null) {
            const controlsLeft = this.appendChild(
                document.createElement("div")
            );

            controlsLeft.classList.add("controls");

            // Remove button
            const removeButton = controlsLeft.appendChild(
                document.createElement("button")
            );
            const removeIcon = removeButton.appendChild(
                document.createElement("i")
            );

            removeIcon.classList.add("ibm-trash-can");
            removeButton.classList.add(
                "remove",
                "button",
                "button-destructive"
            );
            removeButton.onclick = () => this.editor!.removeBlock(this);

            // Drag button
            const dragButton = controlsLeft.appendChild(
                document.createElement("button")
            );
            const dragIcon = dragButton.appendChild(
                document.createElement("i")
            );

            dragIcon.classList.add("ibm-draggable");
            dragButton.classList.add("draggable", "button", "button-muted");
        }

        // Wrapper
        this.element = this.render();
        this.element.classList.add("content");
        this.appendChild(this.element);

        // Right controls
        if (this.mosaic === null) {
            const controlsRight = this.appendChild(
                document.createElement("div")
            );

            controlsRight.classList.add("controls");

            // Add button
            const addButton = controlsRight.appendChild(
                document.createElement("button")
            );
            const addIcon = addButton.appendChild(document.createElement("i"));

            addIcon.classList.add("ibm-add");
            addButton.classList.add("add", "button", "button-primary");
            addButton.onclick = () =>
                this.editor!.addBlock("paragraph", undefined, this);
        }
    }
}
