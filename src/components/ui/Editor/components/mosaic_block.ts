import Sortable from "sortablejs";
import { Block, type BlockType } from "../interfaces/block";
import { ImageBlock } from "./image_block";
import { Toolbar } from "./toolbar";
import { VideoBlock } from "./video_block";

export class MosaicBlock extends Block {
    private sortable!: Sortable;
    private controller?: {
        style: { [key: string]: any };
        data: any[];
    };

    static get info(): {
        type: BlockType;
        title: string;
        icon: string;
    } {
        return {
            type: "mosaic",
            title: "Mosaico",
            icon: "template"
        };
    }

    get type(): BlockType {
        return MosaicBlock.info.type;
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        this.sortable = new Sortable(element, {
            chosenClass: "dragging",
            ghostClass: "ghost-dragged",
            animation: 150,
            onStart: () => this.editor.hideToolbar()
        });
        element.addEventListener("click", (ev) => {
            ev.stopPropagation();
            this.editor.showToolbar(this);
        });
        // Load styles
        element.style.gridTemplateColumns = this.controller?.style.template
            ? `repeat(${this.controller?.style.template}, minmax(0px, 1fr))`
            : "";
        element.style.gridAutoRows = this.controller?.style.template
            ? `calc((100vw - (var(--space-x) * 2) - (var(--space) * 4 * ${this.controller?.style.template - 1})) / ${this.controller?.style.template})`
            : "";
        // Load data
        this.controller?.data.forEach(({ type, style, data }) => {
            const block = element.appendChild(
                document.createElement(`${type}-block`)
            ) as Block;

            block.load({ style, data });
        });
        return element;
    }

    load(params: { style?: any; data?: any[] }): void {
        const { style = {}, data = [] } = params;

        if (this.element) {
            const element = this.element;

            // Load style
            element.style.gridTemplateColumns = this.controller?.style.template
                ? `repeat(${this.controller?.style.template}, minmax(0px, 1fr))`
                : "";
            element.style.gridAutoRows = this.controller?.style.template
                ? `calc((100vw - (var(--space-x) * 2) - (var(--space) * 4 * ${this.controller?.style.template - 1})) / ${this.controller?.style.template})`
                : "";
            // Load data
            data.forEach(({ type, style, data }) => {
                const block = element.appendChild(
                    document.createElement(`${type}-block`)
                ) as Block;

                block.load({ style, data });
            });
        } else {
            this.controller = {
                style,
                data: Array.isArray(data) ? data : [data]
            };
        }
    }

    save(): { style?: any; data?: any | any[] } {
        const element = this.element;
        const attrs: any = {};

        if (element.style.gridTemplateColumns) {
            attrs.template =
                Number(
                    element.style.gridTemplateColumns.replace(
                        /repeat\(([0-9]+), minmax\(0px, 1fr\)\)/,
                        "$1"
                    )
                ) || undefined;
        }
        return {
            style: Object.keys(attrs).length > 0 ? attrs : undefined,
            data: [...this.element.children]
                .filter((e) => e instanceof Block)
                .map((block: Block) => {
                    const { type } = block;
                    const { style, data } = block.save();

                    return { type, style, data };
                })
        };
    }

    addBlock(type: BlockType) {
        this.element.appendChild(document.createElement(`${type}-block`));
    }

    removeBlock(block: Block) {
        this.element.removeChild(block);
    }

    override toolbar() {
        const rect = this.element.getBoundingClientRect();

        const getTemplate = () => {
            return (
                Number(
                    this.element.style.gridTemplateColumns.replace(
                        /repeat\(([0-9]+), minmax\(0px, 1fr\)\)/,
                        "$1"
                    )
                ) || null
            );
        };

        const changeTemplate = (template: number | null) => {
            if (template !== null) {
                template = Math.min(Math.max(template, 1), 24);
                this.element.style.gridTemplateColumns = `repeat(${template}, minmax(0px, 1fr))`;
                this.element.style.gridAutoRows = `calc((100vw - (var(--space-x) * 2) - (var(--space) * 4 * ${template - 1})) / ${template})`;
            } else {
                this.element.style.gridTemplateColumns = "";
                this.element.style.gridAutoRows = "";
            }
        };

        return new Toolbar(
            [
                {
                    type: "group" as const,
                    icon: "template",
                    variant: () => (getTemplate() ? "accent" : null),
                    children: [
                        {
                            type: "number" as const,
                            label: "Plantilla",
                            value: () => getTemplate(),
                            onChange: (value: any) => changeTemplate(value)
                        }
                    ]
                },
                {
                    type: "group" as const,
                    icon: "add",
                    children: [
                        {
                            type: "button" as const,
                            icon: ImageBlock.info.icon,
                            label: ImageBlock.info.title,
                            onClick: () => this.addBlock(ImageBlock.info.type)
                        },
                        {
                            type: "button" as const,
                            icon: VideoBlock.info.icon,
                            label: VideoBlock.info.title,
                            onClick: () => this.addBlock(VideoBlock.info.type)
                        }
                    ]
                }
            ],
            {
                left: rect.left + rect.width / 2,
                top: rect.top
            }
        );
    }

    override destroy(): void {
        this.sortable.destroy();
    }
}
