// Auth
export * from "./auth/insert_user";
export * from "./auth/update_user";

// Comments
export * from "./comments/count_comments";
export * from "./comments/delete_comment";
export * from "./comments/insert_comment";
export * from "./comments/select_comment";
export * from "./comments/select_comment_replies";
export * from "./comments/select_comments";
export * from "./comments/update_comment";

// Stages
export * from "./stages/count_stages";
export * from "./stages/select_stage";
export * from "./stages/select_stages";

// Trips
export * from "./trips/count_trips";
export * from "./trips/select_trip";
export * from "./trips/select_trips";
export * from "./trips/trip_exists";

export type DataType = Record<string, any> | undefined;
export type ListDataType = Record<string, any>[];
