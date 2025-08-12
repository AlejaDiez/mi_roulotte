import { addNewComment } from "./comments/add_new_comment";
import { deleteComment } from "./comments/delete_comment";
import { getCommentById } from "./comments/get_comment_by_id";
import { getComments } from "./comments/get_comments";
import { replyComment } from "./comments/reply_comment";
import { unsubscribeRepliesNotifications } from "./comments/unsubscribe_replies_notifications";
import { getStageById } from "./stages/get_stage_by_id";
import { getStages } from "./stages/get_stages";
import { getTripById } from "./trips/get_trip_by_id";
import { getTrips } from "./trips/get_trips";

export const server = {
    // Comments
    addNewComment,
    deleteComment,
    getCommentById,
    getComments,
    replyComment,
    unsubscribeRepliesNotifications,

    // Stages
    getStageById,
    getStages,

    // Trips
    getTripById,
    getTrips
};
