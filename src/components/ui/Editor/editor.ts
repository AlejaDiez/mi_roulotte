import Sortable from "sortablejs";
import { Block } from "./blocks/Block";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { Toolbar } from "./toolbar";

const blocks = [HeadingBlock, ParagraphBlock];

export class Editor extends HTMLElement {
    private readonly blocks: HTMLDivElement;
    private toolbar: Toolbar | null;

    constructor() {
        super();
        // Blocks list
        this.blocks = document.createElement("div");
        this.blocks.classList.add("block-list");
        new Sortable(this.blocks, {
            handle: ".draggable",
            direction: "vertical",
            chosenClass: "dragging",
            ghostClass: "ghost-dragged",
            animation: 150,
            onStart: () => this.hideToolbar()
        });
        this.appendChild(this.blocks);
        // Define blocks components
        blocks.forEach((e) => {
            if (!customElements.get(`${e.info.type}-block`)) {
                customElements.define(`${e.info.type}-block`, e);
            }
        });
        // Toolbar
        this.toolbar = null;
        document.addEventListener("click", ({ target }) => {
            if (!this.toolbar?.element.contains(target as Node)) {
                this.hideToolbar();
            }
        });
    }

    addBlock(
        type: string,
        params: { style?: any; data?: any | any[] } = {},
        ref?: Block
    ) {
        if (!blocks.find((e) => e.info.type === type)) {
            throw new Error(`${type} block is not defined`);
        }

        const block = document.createElement(`${type}-block`) as Block;

        block.load(params);

        this.blocks.insertBefore(block, ref?.nextSibling ?? null);
    }

    removeBlock(element: Block) {
        const block = this.blocks.removeChild(element);

        block.destroy();
    }

    load(data: any[]) {
        this.clear();
        data.forEach(({ type, style, data }) =>
            this.addBlock(type, { style, data })
        );
    }

    save() {
        return [...this.blocks.children]
            .filter((e) => e instanceof Block)
            .map(({ type, save }: Block) => {
                const { style, data } = save();

                return { type, style, data };
            });
    }

    clear() {
        [...this.blocks.children].forEach((element) => {
            const block = this.blocks.removeChild(element);

            if (block instanceof Block) {
                block.destroy();
            }
        });
    }

    showToolbar(block: Block) {
        if (this.toolbar) {
            this.hideToolbar();
        }
        this.toolbar = block.toolbar();
        if (this.toolbar) {
            this.appendChild(this.toolbar.element);
        }
    }

    hideToolbar() {
        if (this.toolbar) {
            this.removeChild(this.toolbar.element);
        }
        this.toolbar = null;
    }
}

if (!customElements.get("block-editor")) {
    customElements.define("block-editor", Editor);
}
