import { toggleMark } from "prosemirror-commands";
import { MarkType, Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Block, type BlockType } from "../interfaces/block";
import { Toolbar } from "./toolbar";

const schema: Schema = new Schema({
    nodes: {
        doc: { content: "text*" },
        text: { group: "inline" }
    },
    marks: {
        bold: {
            toDOM: () => ["b", 0]
        },
        italic: {
            toDOM: () => ["i", 0]
        },
        underline: {
            toDOM: () => ["u", 0]
        },
        strikethrough: {
            toDOM: () => ["s", 0]
        },
        color: {
            attrs: { color: {} },
            toDOM: ({ attrs }) => [
                "font",
                { style: `color: var(--color-${attrs.color})` },
                0
            ]
        }
    }
});

export class HeadingBlock extends Block {
    private readonly controller: EditorView = new EditorView(null, {
        state: EditorState.create({ schema })
    });

    static get info(): {
        type: BlockType;
        title: string;
        icon: string;
    } {
        return {
            type: "heading",
            title: "Título",
            icon: "heading"
        };
    }

    get type(): BlockType {
        return HeadingBlock.info.type;
    }

    render(): HTMLElement {
        const element = this.controller.dom;

        element.addEventListener("click", (ev) => {
            ev.stopPropagation();
            this.editor.showToolbar(this);
        });
        element.addEventListener("input", () => this.editor.hideToolbar());
        return element;
    }

    load(params: { style?: any; data?: any | any[] }): void {
        const { style = {}, data = [] } = params;

        // Load style
        this.controller.dom.style.textAlign = style.align ?? "";
        // Load data
        const doc = schema.node(
            "doc",
            null,
            (Array.isArray(data) ? data : [data]).map(({ text, style }) => {
                const marks = [];

                if (style?.bold) {
                    marks.push(schema.marks.bold.create());
                }
                if (style?.italic) {
                    marks.push(schema.marks.italic.create());
                }
                if (style?.underline) {
                    marks.push(schema.marks.underline.create());
                }
                if (style?.strikethrough) {
                    marks.push(schema.marks.strikethrough.create());
                }
                if (style?.color) {
                    marks.push(
                        schema.marks.color.create({
                            color: style.color
                        })
                    );
                }
                return schema.text(text, marks);
            })
        );

        this.controller.updateState(EditorState.create({ schema, doc }));
    }

    save(): { style?: any; data?: any | any[] } {
        const save = (node: Node, attrs: any = {}): any[] => {
            if (node.nodeType === Node.TEXT_NODE) {
                return [
                    {
                        text: node.textContent,
                        ...attrs
                    }
                ];
            }

            // Check attributes
            const newAttrs: any = { ...attrs };

            switch (node.nodeName.toLowerCase()) {
                case "b":
                    newAttrs.style = {
                        bold: true,
                        ...newAttrs.style
                    };
                    break;
                case "i":
                    newAttrs.style = {
                        italic: true,
                        ...newAttrs.style
                    };
                    break;
                case "u":
                    newAttrs.style = {
                        underline: true,
                        ...newAttrs.style
                    };
                    break;
                case "s":
                    newAttrs.style = {
                        strikethrough: true,
                        ...newAttrs.style
                    };
                    break;
                case "font":
                    newAttrs.style = {
                        color: (node as HTMLFontElement).style.color.replace(
                            /^var\(--color-(.+)\)$/,
                            "$1"
                        ),
                        ...newAttrs.style
                    };
                    break;
            }
            return Array.from(node.childNodes).flatMap((e) =>
                save(e, newAttrs)
            );
        };

        const nodes = Array.from(this.element.childNodes).flatMap(save);
        const attrs: any = {};

        if ((this.element.style.textAlign || "left") !== "left") {
            attrs.align = this.element.style.textAlign;
        }
        return {
            style: Object.keys(attrs).length > 0 ? attrs : undefined,
            data: nodes.length === 1 ? nodes[0] : nodes
        };
    }

    override toolbar() {
        const range = window.getSelection()?.getRangeAt(0);

        if (
            !range ||
            range.toString().length === 0 ||
            !this.element?.contains(range.commonAncestorContainer)
        ) {
            return null;
        }

        const rect = range.getBoundingClientRect();

        const hasAlign = (align: string) => {
            return (this.element.style.textAlign || "left") === align;
        };

        const setAlign = (align: string) => {
            this.element.style.textAlign = align;
        };

        const hasStyle = (style: MarkType) => {
            const { from, to } = this.controller.state.selection;

            return this.controller.state.doc.rangeHasMark(from, to, style);
        };

        const toggleStyle = (style: MarkType) => {
            toggleMark(style)(this.controller.state, this.controller.dispatch);
            this.controller.focus();
        };

        const applyMark = (mark: MarkType, attrs: Record<string, any>) => {
            const { from, to } = this.controller.state.selection;

            this.controller.dispatch(
                this.controller.state.tr.addMark(from, to, mark.create(attrs))
            );
            this.controller.focus();
        };

        const removeMark = (mark: MarkType) => {
            const { from, to } = this.controller.state.selection;

            this.controller.dispatch(
                this.controller.state.tr.removeMark(from, to, mark)
            );
            this.controller.focus();
        };

        const toggleColor = (color: string) => {
            applyMark(schema.marks.color, { color });
        };

        const resetColor = () => {
            removeMark(schema.marks.color);
        };

        return new Toolbar(
            [
                {
                    type: "group" as const,
                    icon: () =>
                        `text-align-${this.element.style.textAlign || "left"}`,
                    children: [
                        ["left", "Izquierda"],
                        ["center", "Centrado"],
                        ["right", "Derecha"]
                    ].map(([align, label]) => ({
                        type: "button" as const,
                        label,
                        icon: `text-align-${align}`,
                        variant: () => (hasAlign(align) ? "accent" : null),
                        onClick: () => setAlign(align)
                    }))
                },
                { type: "separator" as const },
                {
                    type: "button" as const,
                    icon: "text-italic",
                    variant: () =>
                        hasStyle(schema.marks.italic) ? "accent" : null,
                    onClick: () => toggleStyle(schema.marks.italic)
                },
                {
                    type: "button" as const,
                    icon: "text-underline",
                    variant: () =>
                        hasStyle(schema.marks.underline) ? "accent" : null,
                    onClick: () => toggleStyle(schema.marks.underline)
                },
                {
                    type: "button" as const,
                    icon: "text-strikethrough",
                    variant: () =>
                        hasStyle(schema.marks.strikethrough) ? "accent" : null,
                    onClick: () => toggleStyle(schema.marks.strikethrough)
                },
                {
                    type: "group" as const,
                    icon: "text-color",
                    variant: () =>
                        hasStyle(schema.marks.color) ? "accent" : null,
                    children: [
                        {
                            type: "custom" as const,
                            render: (update: any) => {
                                const div = document.createElement("div");
                                const resetButton =
                                    document.createElement("button");

                                [
                                    "red",
                                    "orange",
                                    "yellow",
                                    "green",
                                    "teal",
                                    "cyan",
                                    "blue",
                                    "purple",
                                    "magenta",
                                    "gray"
                                ].forEach((e) => {
                                    const button =
                                        document.createElement("button");
                                    button.style.backgroundColor = `var(--color-${e})`;
                                    button.onclick = () => {
                                        toggleColor(e);
                                        update();
                                    };
                                    div.appendChild(button);
                                });

                                resetButton.style.background = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><line x1='32' y1='32' x2='0' y2='0' stroke='red' stroke-width='2'/></svg>") no-repeat center/cover`;
                                resetButton.style.border =
                                    "1px solid var(--color-foreground)";
                                resetButton.onclick = () => {
                                    resetColor();
                                    update();
                                    update();
                                };
                                div.appendChild(resetButton);

                                div.classList.add("color-palette");
                                return div;
                            }
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
        this.controller.destroy();
        super.destroy();
    }
}
