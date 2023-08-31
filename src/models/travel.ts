import type { Image } from "@models/image";
import type { Video } from "@models/video";

export default interface Travel {
    date: Date;
    title: string;
    subtitle: string;
    description: string;
    image: Image;
    video?: Video;
    keywords?: string[];
}
