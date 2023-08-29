export default interface DefaultProps {
    id?: string;
    classList?:
        | Record<string, boolean>
        | Record<any, any>
        | Iterable<string>
        | Iterable<any>
        | string;
    class?: string;
}
