import { toggleMark } from "prosemirror-commands";
import { MarkType, Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import type { Block } from "..";

type HeadingStyle = {
    align?: "left" | "center" | "right";
};

type HeadingData = {
    text: string;
    style?: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
        color?: string;
    };
};

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

export default class HeadingBlock implements Block {
    private readonly initStyle: HeadingStyle;
    private readonly initData: HeadingData[];
    private readonly controller: EditorView;

    static get info() {
        return {
            title: "Título",
            icon: "heading"
        };
    }

    constructor({ style = {}, data = [] }: any) {
        this.initStyle = style;
        this.initData = Array.isArray(data) ? data : [data];
        this.controller = new EditorView(null, {
            state: EditorState.create({ schema }),
            attributes: { class: "heading-block" }
        });
    }

    destroy() {
        this.controller.destroy();
    }

    render() {
        // Add data
        const doc = schema.node(
            "doc",
            null,
            this.initData.map((item) => {
                const marks = [];

                if (item.style?.bold) {
                    marks.push(schema.marks.bold.create());
                }
                if (item.style?.italic) {
                    marks.push(schema.marks.italic.create());
                }
                if (item.style?.underline) {
                    marks.push(schema.marks.underline.create());
                }
                if (item.style?.strikethrough) {
                    marks.push(schema.marks.strikethrough.create());
                }
                if (item.style?.color) {
                    marks.push(
                        schema.marks.color.create({
                            color: item.style.color
                        })
                    );
                }
                return schema.text(item.text, marks);
            })
        );
        const state = EditorState.create({ schema, doc });

        this.controller.updateState(state);

        // Style
        this.controller.dom.style.textAlign = this.initStyle.align ?? "";

        // Return element
        return this.controller.dom;
    }

    toolbar() {
        const hasAlign = (align: string) => {
            return (this.controller.dom.style.textAlign || "justify") === align;
        };

        const setAlign = (align: string) => {
            this.controller.dom.style.textAlign = align;
        };

        const hasStyle = (style: MarkType) => {
            const { from, $from, to, empty } = this.controller.state.selection;

            return empty
                ? !!style.isInSet(
                      this.controller.state.storedMarks || $from.marks()
                  )
                : this.controller.state.doc.rangeHasMark(from, to, style);
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

        return {
            children: [
                {
                    type: "group" as const,
                    icon: () =>
                        `text-align-${this.controller.dom.style.textAlign || "justify"}`,
                    children: ["left", "center", "right", "justify"].map(
                        (align) => ({
                            type: "button" as const,
                            label: align,
                            icon: `text-align-${align}`,
                            variant: () => (hasAlign(align) ? "accent" : null),
                            onClick: () => setAlign(align)
                        })
                    )
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
                            render: (_: any, update: any) => {
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
            position: (element: HTMLElement) => {
                const selection = window.getSelection();

                if (!selection || selection.rangeCount === 0) return null;

                const range = selection.getRangeAt(0);

                if (
                    range.toString().length === 0 ||
                    !element.contains(range.commonAncestorContainer)
                ) {
                    return null;
                }

                const rect = range.getBoundingClientRect();

                return rect
                    ? { left: rect.left + rect.width / 2, top: rect.top }
                    : null;
            }
        };
    }

    data(element: HTMLElement) {
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

        const nodes = Array.from(element.childNodes).flatMap(save);

        return nodes.length === 1 ? nodes[0] : nodes;
    }

    style(element: HTMLElement) {
        const res: any = {};

        if ((element.style.textAlign || "left") !== "left") {
            res.align = element.style.textAlign;
        }
        return Object.keys(res).length > 0 ? res : undefined;
    }
}
