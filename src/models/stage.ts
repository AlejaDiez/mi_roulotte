import type { CommentPreview, PartialCommentPreview } from "@models/comment";

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

export type PartialStage = Partial<
    Omit<Stage, "comments"> & {
        comments: PartialCommentPreview[];
    }
>;

export interface StagePreview {
    name: string;
    date: Date;
    title: string;
    description: string | null;
    image: string | null;
    url: string;
}

export type PartialStagePreview = Partial<StagePreview>;
