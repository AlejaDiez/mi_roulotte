export interface BaseProps {
    id?: string;
    class?: string;
}

export const hashClass = (element: HTMLElement) =>
    [...element.classList.values()].filter((e) => e.startsWith("astro-"));
