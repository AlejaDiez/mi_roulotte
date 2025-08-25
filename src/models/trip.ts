import type { CommentPreview, PartialCommentPreview } from "@models/comment";
import type { PartialStagePreview, StagePreview } from "@models/stage";

export interface Trip {
    id: string;
    name: string;
    date: Date;
    title: string;
    description: string | null;
    image: string | null;
    video: string | null;
    content: object[];
    stages: StagePreview[];
    keywords: string[] | null;
    published: boolean;
    allowComments: boolean;
    comments?: CommentPreview[];
    url: string;
    createdAt: Date;
    updatedAt: Date | null;
}

export type PartialTrip = Partial<
    Omit<Omit<Trip, "stages">, "comments"> & {
        stages: PartialStagePreview[];
        comments: PartialCommentPreview[] | null;
    }
>;

export interface TripPreview {
    name: string;
    date: Date;
    title: string;
    description: string | null;
    image: string | null;
    video: string | null;
    url: string;
}

export type PartialTripPreview = Partial<TripPreview>;
