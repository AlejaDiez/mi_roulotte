import { Block, type BlockType } from "../interfaces/block";
import { Toolbar } from "./toolbar";

export class ImageBlock extends Block {
    private controller?: {
        style: { [key: string]: any };
        url: string;
        caption: string;
    };

    static get info(): {
        type: BlockType;
        title: string;
        icon: string;
    } {
        return {
            type: "image",
            title: "Imagen",
            icon: "image"
        };
    }

    get type(): BlockType {
        return ImageBlock.info.type;
    }

    render(): HTMLElement {
        const element = document.createElement("img");

        element.addEventListener("click", (ev) => {
            ev.stopPropagation();
            this.editor.showToolbar(this);
        });
        if (this.controller) {
            // Load style
            element.style.aspectRatio =
                this.controller.style["aspect-ratio"] ?? "";
            // Load data
            element.src = this.controller.url;
            element.alt = this.controller.caption;
        }
        return element;
    }

    load(params: { style?: any; data?: any | any[] }): void {
        const { style = {}, data = {} } = params;

        if (this.element) {
            const element = this.element as HTMLImageElement;

            // Load style
            element.style.aspectRatio = style["aspect-ratio"] ?? "";
            // Load data
            element.src = data.url;
            element.alt = data.caption;
        } else {
            this.controller = {
                style,
                url: data.url,
                caption: data.caption
            };
        }
    }

    save(): { style?: any; data?: any | any[] } {
        const element = this.element;
        const attrs: any = {};

        if (element.style.aspectRatio) {
            attrs["aspect-ratio"] = element.style.aspectRatio.replace(
                /\s/g,
                ""
            );
        }
        return {
            style: Object.keys(attrs).length > 0 ? attrs : undefined,
            data: {
                url: element.getAttribute("src") ?? "",
                caption: element.getAttribute("alt") ?? undefined
            }
        };
    }

    override toolbar() {
        const rect = this.element.getBoundingClientRect();

        const hasAspectRatio = (aspectRatio: string) => {
            return (
                this.element.style.aspectRatio.replace(/\s/g, "") ===
                aspectRatio
            );
        };

        const setAspectRatio = (aspectRatio: string) => {
            this.element.style.aspectRatio = aspectRatio;
        };

        const getImage = () => {
            return this.element.getAttribute("src");
        };

        const changeImage = (url: string) => {
            url = url.trim();
            if (url) {
                this.element.setAttribute("src", url);
            } else {
                this.element.removeAttribute("src");
            }
        };

        const getCaption = () => {
            return this.element.getAttribute("alt");
        };

        const changeCaption = (caption: string) => {
            caption = caption.trim();
            if (caption) {
                this.element.setAttribute("alt", caption);
            } else {
                this.element.removeAttribute("alt");
            }
        };

        return new Toolbar(
            [
                {
                    type: "group" as const,
                    icon: "image",
                    variant: () => (getImage() ? "accent" : null),
                    children: [
                        {
                            type: "input" as const,
                            label: "URL de la imagen",
                            value: () => getImage() ?? "",
                            onChange: (value: any) => changeImage(value)
                        }
                    ]
                },
                {
                    type: "group" as const,
                    icon: "label",
                    variant: () => (getCaption() ? "accent" : null),
                    children: [
                        {
                            type: "input" as const,
                            label: "Leyenda de la imagen",
                            value: () => getCaption() ?? "",
                            onChange: (value: any) => changeCaption(value)
                        }
                    ]
                },
                { type: "separator" as const },
                {
                    type: "group" as const,
                    icon: "fit-to-screen",
                    children: [
                        {
                            type: "button" as const,
                            label: "Original",
                            variant: () =>
                                hasAspectRatio("") ? "accent" : null,
                            onClick: () => setAspectRatio("")
                        },
                        {
                            type: "button" as const,
                            label: "Cuadrado (1:1)",
                            variant: () =>
                                hasAspectRatio("1/1") ? "accent" : null,
                            onClick: () => setAspectRatio("1/1")
                        },
                        { type: "separator" as const },
                        {
                            type: "button" as const,
                            label: "Estándar (4:3)",
                            variant: () =>
                                hasAspectRatio("4/3") ? "accent" : null,
                            onClick: () => setAspectRatio("4/3")
                        },
                        {
                            type: "button" as const,
                            label: "Clásico (3:2)",
                            variant: () =>
                                hasAspectRatio("3/2") ? "accent" : null,
                            onClick: () => setAspectRatio("3/2")
                        },
                        {
                            type: "button" as const,
                            label: "Panorámico (16:9)",
                            variant: () =>
                                hasAspectRatio("16/9") ? "accent" : null,
                            onClick: () => setAspectRatio("16/9")
                        },
                        { type: "separator" as const },
                        {
                            type: "button" as const,
                            label: "Retrato (3:4)",
                            variant: () =>
                                hasAspectRatio("3/4") ? "accent" : null,
                            onClick: () => setAspectRatio("3/4")
                        },
                        {
                            type: "button" as const,
                            label: "Retrato fotográfico (2:3)",
                            variant: () =>
                                hasAspectRatio("2/3") ? "accent" : null,
                            onClick: () => setAspectRatio("2/3")
                        },
                        {
                            type: "button" as const,
                            label: "Vertical (9:16)",
                            variant: () =>
                                hasAspectRatio("9/16") ? "accent" : null,
                            onClick: () => setAspectRatio("9/16")
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
}
