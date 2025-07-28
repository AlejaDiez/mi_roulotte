import type { StagePreview } from "./stage";

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
    createdAt: Date;
    modifiedAt: Date | null;
}

export interface TripPreview {
    name: string;
    date: Date;
    title: string;
    description: string | null;
    image: string | null;
    video: string | null;
    url: string;
}
