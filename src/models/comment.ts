export interface Comment {
    id: string;
    tripId: string;
    stageId: string | null;
    username: string;
    email: string;
    content: string;
    repliedTo: string | null;
    replies: Comment[];
    url: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

export type PartialComment = Partial<
    Omit<Comment, "replies"> & {
        replies: Partial<Omit<Comment, "repliedTo">>[];
    }
>;

export interface CommentPreview {
    id: string;
    username: string;
    content: string;
    replies: CommentPreview[];
    url: string;
    lastUpdatedAt: Date;
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
        ? new Map(
              comments.map(
                  ({
                      _id,
                      url,
                      userAgent,
                      ipAddress,
                      lastUpdatedAt,
                      createdAt,
                      updatedAt,
                      ...rest
                  }) => [
                      _id,
                      {
                          ...rest,
                          replies: [],
                          url,
                          userAgent,
                          ipAddress,
                          lastUpdatedAt,
                          createdAt,
                          updatedAt
                      }
                  ]
              )
          )
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
