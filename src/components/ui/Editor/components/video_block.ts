import { Block, type BlockType } from "../interfaces/block";
import { Toolbar } from "./toolbar";

import { YouTube } from "@utils/video";

export class VideoBlock extends Block {
    private controller?: {
        style: { [key: string]: any };
        url: string;
        title?: string;
        thumbnail?: string;
    };

    static get info(): {
        type: BlockType;
        title: string;
        icon: string;
    } {
        return {
            type: "video",
            title: "Vídeo",
            icon: "video-player"
        };
    }

    get type(): BlockType {
        return VideoBlock.info.type;
    }

    render(): HTMLElement {
        const element = document.createElement("div");
        const thumbnail = element.appendChild(document.createElement("img"));
        const title = element.appendChild(document.createElement("span"));
        const url = element.appendChild(document.createElement("a"));

        url.target = "_blank";
        element.addEventListener("click", (ev) => {
            ev.stopPropagation();
            this.editor.showToolbar(this);
        });
        if (this.controller) {
            // Load style
            element.style.aspectRatio =
                this.controller.style["aspect-ratio"] ?? "";
            // Load data
            url.href = this.controller.url;
            title.textContent = this.controller.title ?? "";
            thumbnail.src = this.controller.thumbnail ?? "";

            const youtubeId = YouTube.getId(this.controller.url);

            if (youtubeId) {
                YouTube.getData(youtubeId).then(
                    ({
                        title: fetchedTitle,
                        thumbnail_url: fetchedThumbnail
                    }) => {
                        if (!this.controller?.title) {
                            title.textContent = fetchedTitle;
                        }
                        title.setAttribute("data-fetched", fetchedTitle);
                        if (!this.controller?.thumbnail) {
                            thumbnail.src = fetchedThumbnail;
                        }
                        thumbnail.setAttribute(
                            "data-fetched",
                            fetchedThumbnail
                        );
                    }
                );
            }
        }
        return element;
    }

    load(params: { style?: any; data?: any | any[] }): void {
        const { style = {}, data = {} } = params;

        if (this.element) {
            const element = this.element;
            const url = element.querySelector<HTMLAnchorElement>("& > a")!;
            const title = element.querySelector<HTMLSpanElement>("& > span")!;
            const thumbnail =
                element.querySelector<HTMLImageElement>("& > img")!;

            // Load style
            element.style.aspectRatio = style["aspect-ratio"] ?? "";
            // Load data
            url.href = data.url;
            title.textContent = data.title ?? "";
            thumbnail.src = data.thumbnail ?? "";

            const youtubeId = YouTube.getId(data.url);

            if (youtubeId) {
                YouTube.getData(youtubeId).then(
                    ({
                        title: fetchedTitle,
                        thumbnail_url: fetchedThumbnail
                    }) => {
                        if (!data.title) {
                            title.textContent = fetchedTitle;
                        }
                        title.setAttribute("data-fetched", fetchedTitle);
                        if (!data.thumbnail) {
                            thumbnail.src = fetchedThumbnail;
                        }
                        thumbnail.setAttribute(
                            "data-fetched",
                            fetchedThumbnail
                        );
                    }
                );
            }
        } else {
            this.controller = {
                style,
                url: data.url,
                title: data.title,
                thumbnail: data.thumbnail
            };
        }
    }

    save(): { style?: any; data?: any | any[] } {
        const attrs: any = {};
        const element = this.element;
        const url = element.querySelector<HTMLAnchorElement>("& > a")!;
        const title = element.querySelector<HTMLSpanElement>("& > span")!;
        const thumbnail = element.querySelector<HTMLImageElement>("& > img")!;

        if (element.style.aspectRatio) {
            attrs["aspect-ratio"] = element.style.aspectRatio.replace(
                /\s/g,
                ""
            );
        }
        return {
            style: Object.keys(attrs).length > 0 ? attrs : undefined,
            data: {
                url: url.getAttribute("href") ?? "",
                title:
                    title.textContent === title.getAttribute("data-fetched")
                        ? undefined
                        : title.textContent || undefined,
                thumbnail:
                    thumbnail.getAttribute("src") ===
                    thumbnail.getAttribute("data-fetched")
                        ? undefined
                        : thumbnail.getAttribute("src") || undefined
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

        const getVideo = () => {
            return this.element.querySelector("& > a")!.getAttribute("href");
        };

        const changeVideo = (url: string) => {
            const element =
                this.element.querySelector<HTMLAnchorElement>("& > a")!;
            const title =
                this.element.querySelector<HTMLSpanElement>("& > span")!;
            const thumbnail =
                this.element.querySelector<HTMLImageElement>("& > img")!;

            url = url.trim();

            // Update fetched data
            if (url !== element.getAttribute("href")) {
                if (title.textContent === title.getAttribute("data-fetched")) {
                    title.textContent = "";
                }
                title.removeAttribute("data-fetched");
                if (
                    thumbnail.getAttribute("src") ===
                    thumbnail.getAttribute("data-fetched")
                ) {
                    thumbnail.removeAttribute("src");
                }
                thumbnail.removeAttribute("data-fetched");
            }
            // Update url
            if (url) {
                element.setAttribute("href", url);

                // Update fetched data
                const youtubeId = YouTube.getId(url);

                if (youtubeId) {
                    YouTube.getData(youtubeId).then(
                        ({
                            title: fetchedTitle,
                            thumbnail_url: fetchedThumbnail
                        }) => {
                            if (title.textContent === "") {
                                title.textContent = fetchedTitle;
                            }
                            title.setAttribute("data-fetched", fetchedTitle);
                            if (!thumbnail.hasAttribute("src")) {
                                thumbnail.src = fetchedThumbnail;
                            }
                            thumbnail.setAttribute(
                                "data-fetched",
                                fetchedThumbnail
                            );
                        }
                    );
                }
            } else {
                element.removeAttribute("href");
            }
        };

        const getTitle = () => {
            const element = this.element.querySelector("& > span")!;

            return element.textContent === element.getAttribute("data-fetched")
                ? null
                : element.textContent;
        };

        const changeTitle = (title: string) => {
            const element = this.element.querySelector("& > span")!;

            title = title.trim();
            if (title) {
                element.textContent = title;
            } else {
                element.textContent =
                    element.getAttribute("data-fetched") ?? "";
            }
        };

        const getThumbnail = () => {
            const element = this.element.querySelector("& > img")!;

            return element.getAttribute("src") ===
                element.getAttribute("data-fetched")
                ? null
                : element.getAttribute("src");
        };

        const changeThumbnail = (thumbnail: string) => {
            const element = this.element.querySelector("& > img")!;

            thumbnail = thumbnail.trim();
            if (thumbnail) {
                element.setAttribute("src", thumbnail);
            } else if (element.hasAttribute("data-fetched")) {
                element.setAttribute(
                    "src",
                    element.getAttribute("data-fetched")!
                );
            } else {
                element.removeAttribute("src");
            }
        };

        return new Toolbar(
            [
                {
                    type: "group" as const,
                    icon: "video-player",
                    variant: () => (getVideo() ? "accent" : null),
                    children: [
                        {
                            type: "input" as const,
                            label: "URL del vídeo",
                            value: () => getVideo() ?? "",
                            onChange: (value: any) => changeVideo(value)
                        }
                    ]
                },
                {
                    type: "group" as const,
                    icon: "label",
                    variant: () => (getTitle() ? "accent" : null),
                    children: [
                        {
                            type: "input" as const,
                            label: "Título del vídeo",
                            value: () => getTitle() ?? "",
                            onChange: (value: any) => changeTitle(value)
                        }
                    ]
                },
                {
                    type: "group" as const,
                    icon: "thumbnail-preview",
                    variant: () => (getThumbnail() ? "accent" : null),
                    children: [
                        {
                            type: "input" as const,
                            label: "URL de la miniatura",
                            value: () => getThumbnail() ?? "",
                            onChange: (value: any) => changeThumbnail(value)
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
                            label: "Cuadrado (1:1)",
                            variant: () =>
                                hasAspectRatio("1/1") ? "accent" : null,
                            onClick: () => setAspectRatio("1/1")
                        },
                        { type: "separator" as const },
                        {
                            type: "button" as const,
                            label: "Estándar TV (4:3)",
                            variant: () =>
                                hasAspectRatio("4/3") ? "accent" : null,
                            onClick: () => setAspectRatio("4/3")
                        },
                        {
                            type: "button" as const,
                            label: "Panorámico (16:9)",
                            variant: () =>
                                hasAspectRatio("") ? "accent" : null,
                            onClick: () => setAspectRatio("")
                        },
                        {
                            type: "button" as const,
                            label: "Cinemático (21:9)",
                            variant: () =>
                                hasAspectRatio("21/9") ? "accent" : null,
                            onClick: () => setAspectRatio("21/9")
                        },
                        { type: "separator" as const },
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
