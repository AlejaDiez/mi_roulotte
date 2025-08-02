import type { CommentPreview } from "./comment";

export interface Stage {
    id: string;
    tripId: string;
    name: string;
    date: Date;
    title: string;
    description: string | null;
    image: string | null;
    content: object[];
    keywords: string[] | null;
    published: boolean;
    allowComments: boolean;
    comments?: CommentPreview[];
    url: string;
    createdAt: Date;
    modifiedAt: Date | null;
}

export interface StagePreview {
    name: string;
    date: Date;
    title: string;
    description: string | null;
    image: string | null;
    url: string;
}
