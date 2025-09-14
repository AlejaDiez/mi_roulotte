export interface BaseProps {
    id?: string | null;
    style?: string | astroHTML.JSX.CSSProperties | null;
    class?:
        | string
        | Record<string, boolean>
        | Record<any, any>
        | Iterable<string>
        | Iterable<any>;
}
