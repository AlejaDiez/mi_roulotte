export interface Comment {
    id: number;
    tripId: string;
    stageId: string | null;
    username: string;
    email: string;
    repliedTo: number;
    url: string;
    createdAt: Date;
    modifiedAt: Date | null;
}

export type PartialComment = Partial<
    Comment & {
        replies: Partial<Omit<Comment, "repliedTo">>[];
    }
>;

export interface CommentPreview {
    id: number;
    username: string;
    content: string;
    url: string;
    lastModifiedAt: Date;
    replies: CommentPreview[];
}

export type PartialCommentPreview = Partial<
    Omit<CommentPreview, "replies"> & {
        replies: Partial<CommentPreview>[];
    }
>;

export const buildRelatedComments = (
    comments: any[],
    replies: boolean = true
) => {
    const map = replies
        ? new Map(comments.map((c) => [c._id, { ...c, replies: [] }]))
        : new Map(comments.map((c) => [c._id, { ...c }]));

    return comments.reduce<any[]>((acc, comment) => {
        let { _id, _repliedTo, ...node } = map.get(comment._id);
        const parent = _repliedTo ? map.get(_repliedTo) : null;

        if (parent) {
            parent.replies?.push(node);
        } else {
            acc.push(node);
        }
        return acc;
    }, []);
};
