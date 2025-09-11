import { toggleMark } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { MarkType, Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Toolbar } from "../toolbar";
import { Block } from "./block";

const schema: Schema = new Schema({
    nodes: {
        doc: { content: "inline*" },
        text: { inline: true, group: "inline" },
        hard_break: {
            inline: true,
            group: "inline",
            selectable: false,
            toDOM: () => ["br"]
        }
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
        },
        link: {
            attrs: { url: {}, self: { default: true } },
            toDOM: ({ attrs }) => [
                "a",
                {
                    href: attrs.url,
                    target: `_${attrs.self ? "self" : "blank"}`
                },
                0
            ]
        }
    }
});

export class ParagraphBlock extends Block {
    private readonly controller: EditorView;

    static get info(): {
        type: string;
        title: string;
        icon: string;
    } {
        return {
            type: "paragraph",
            title: "Párrafo",
            icon: "paragraph"
        };
    }

    get type(): string {
        return ParagraphBlock.info.type;
    }

    constructor() {
        super();
        this.controller = new EditorView(null, {
            state: EditorState.create({ schema }),
            plugins: [
                keymap({
                    Enter: (state, dispatch) => {
                        const { hard_break } = state.schema.nodes;

                        if (!hard_break) {
                            return false;
                        }
                        if (dispatch) {
                            dispatch(
                                state.tr
                                    .replaceSelectionWith(hard_break.create())
                                    .scrollIntoView()
                            );
                        }
                        return true;
                    }
                })
            ]
        });
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
        this.controller.dom!.style.textAlign = style.align ?? "";

        // Load data
        const doc = schema.node(
            "doc",
            null,
            (Array.isArray(data) ? data : [data]).map(
                ({ text, url, self, style }) => {
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
                    if (url) {
                        marks.push(
                            schema.marks.link.create({
                                url: url,
                                self: self !== false
                            })
                        );
                    }
                    if (text.trim() === "/n") {
                        return schema.node("hard_break");
                    }
                    return schema.text(text, marks);
                }
            )
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
                case "a":
                    newAttrs.url = (node as HTMLAnchorElement).href;
                    newAttrs.self =
                        (node as HTMLAnchorElement).target === "_self";
                    break;
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
                case "br":
                    return [{ text: "/n" }];
            }
            return Array.from(node.childNodes).flatMap((e) =>
                save(e, newAttrs)
            );
        };

        const nodes = Array.from(this.element!.childNodes).flatMap(save);
        const attrs: any = {};

        while (nodes.length && nodes[nodes.length - 1].text === "\n") {
            nodes.pop();
        }
        if ((this.element!.style.textAlign || "justify") !== "justify") {
            attrs.align = this.element!.style.textAlign;
        }
        return {
            style: Object.keys(attrs).length > 0 ? attrs : undefined,
            data: nodes.length === 1 ? nodes[0] : nodes
        };
    }

    override toolbar() {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (
            !range ||
            range.toString().length === 0 ||
            !this.element?.contains(range.commonAncestorContainer)
        ) {
            return null;
        }

        const hasAlign = (align: string) => {
            return (this.element!.style.textAlign || "justify") === align;
        };

        const setAlign = (align: string) => {
            this.element!.style.textAlign = align;
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

        const getLink = () => {
            const { from, $from, to, empty } = this.controller.state.selection;
            const findLink = (marks: readonly any[]) =>
                marks.find((m) => m.type === schema.marks.link);

            if (empty) {
                const link = findLink(
                    this.controller.state.storedMarks || $from.marks()
                );

                return link ? { ...link.attrs } : null;
            } else {
                let result: any = null;

                this.controller.state.doc.nodesBetween(from, to, (node) => {
                    const link = findLink(node.marks);

                    if (link) {
                        result = { ...link.attrs };
                        return false;
                    }
                });
                return result;
            }
        };

        const toggleLink = (url: string) => {
            if (url.trim()) {
                applyMark(schema.marks.link, { url });
            } else {
                removeMark(schema.marks.link);
            }
        };

        const toggleSelf = (self: boolean) => {
            const { from, to } = this.controller.state.selection;

            this.controller.state.doc.nodesBetween(from, to, (node, pos) => {
                const link = node.marks.find(
                    (m) => m.type === schema.marks.link
                );

                if (link) {
                    this.controller.dispatch(
                        this.controller.state.tr.addMark(
                            pos,
                            pos + node.nodeSize,
                            schema.marks.link.create({
                                ...link.attrs,
                                self
                            })
                        )
                    );
                }
            });
            this.controller.focus();
        };

        const rect = range.getBoundingClientRect();

        return new Toolbar(
            [
                {
                    type: "group" as const,
                    icon: () =>
                        `text-align-${this.element!.style.textAlign || "justify"}`,
                    children: [
                        ["left", "Izquierda"],
                        ["center", "Centrado"],
                        ["right", "Derecha"],
                        ["justify", "Justificado"]
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
                    icon: "text-bold",
                    variant: () =>
                        hasStyle(schema.marks.bold) ? "accent" : null,
                    onClick: () => toggleStyle(schema.marks.bold)
                },
                {
                    type: "button" as const,
                    icon: "text-italic",
                    variant: () =>
                        hasStyle(schema.marks.italic) ? "accent" : null,
                    onClick: () => toggleStyle(schema.marks.italic)
                },
                {
                    type: "group" as const,
                    icon: () => "link",
                    variant: () => (getLink() ? "accent" : null),
                    children: [
                        {
                            type: "input" as const,
                            label: "Escribe la url",
                            value: () => getLink()?.url ?? "",
                            onChange: (value: any) => toggleLink(value)
                        },
                        {
                            type: "switch" as const,
                            label: "Abrir en nueva pestaña",
                            value: () => !(getLink()?.self ?? true),
                            onChange: (value: any) => toggleSelf(!value)
                        }
                    ]
                },
                {
                    type: "group" as const,
                    icon: "chevron-down",
                    children: [
                        {
                            type: "button" as const,
                            label: "Subrayado",
                            icon: "text-underline",
                            variant: () =>
                                hasStyle(schema.marks.underline)
                                    ? "accent"
                                    : null,
                            onClick: () => toggleStyle(schema.marks.underline)
                        },
                        {
                            type: "button" as const,
                            label: "Tachado",
                            icon: "text-strikethrough",
                            variant: () =>
                                hasStyle(schema.marks.strikethrough)
                                    ? "accent"
                                    : null,
                            onClick: () =>
                                toggleStyle(schema.marks.strikethrough)
                        },
                        {
                            type: "group" as const,
                            icon: "text-color",
                            label: "Color de texto",
                            variant: () =>
                                hasStyle(schema.marks.color) ? "accent" : null,
                            children: [
                                {
                                    type: "custom" as const,
                                    render: (update: any) => {
                                        const div =
                                            document.createElement("div");
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
                                                document.createElement(
                                                    "button"
                                                );
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
                    ]
                }
            ],
            { left: rect.left + rect.width / 2, top: rect.top }
        );
    }

    override destroy(): void {
        this.controller.destroy();
        super.destroy();
    }
}
