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

export interface CommentPreview {
    id: number;
    username: string;
    content: string;
    url: string;
    lastModifiedAt: Date;
    replies: CommentPreview[];
}

export const buildRelatedComments = (
    comments: any[],
    transform?: (e: any) => any
) => {
    const map = new Map(
        comments.map((c) => [c.id, { ...c, replies: [] as any[] }])
    );

    return comments.reduce<any[]>((acc, comment) => {
        let node = transform
            ? transform(map.get(comment.id))
            : map.get(comment.id);
        const parent = comment.repliedTo ? map.get(comment.repliedTo) : null;

        if (parent) {
            parent.replies.push(node);
        } else {
            acc.push(node);
        }
        return acc;
    }, []);
};
