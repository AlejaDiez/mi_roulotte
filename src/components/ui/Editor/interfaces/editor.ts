import type { Block, BlockType } from "./block";

export interface Editor {
    addBlock: (
        type: BlockType,
        params?: { style?: any; data?: any | any[] },
        ref?: Block
    ) => void;
    removeBlock: (element: Block) => void;
    load: (data: any[]) => void;
    save: () => void;
    clear: () => void;
    showToolbar: (block: Block) => void;
    hideToolbar: () => void;
}
