import type { ImageMetadata, ImageInputFormat, ImageOutputFormat } from "astro";

export abstract class Image {
    readonly src: string;
    readonly alt: string;
    readonly width: number;
    readonly height: number;

    constructor(src: string, alt: string, width: number, height: number) {
        this.src = src;
        this.alt = alt;
        this.width = width;
        this.height = height;
    }

    abstract copyWith(obj: Partial<Image>): Image;
}

export class LocalImage extends Image implements ImageMetadata {
    readonly format: ImageInputFormat;
    readonly quality: number;
    readonly outputFormat: ImageOutputFormat;

    constructor(
        img: ImageMetadata,
        alt?: string,
        quality?: number,
        outputFormat?: ImageOutputFormat
    ) {
        super(img.src, alt ?? "", img.width, img.height);
        this.format = img.format;
        this.quality = quality ?? 70;
        this.outputFormat = outputFormat ?? "avif";
    }

    copyWith(obj: Partial<LocalImage>): LocalImage {
        return new LocalImage(
            {
                src: obj.src ?? this.src,
                width: obj.width ?? this.width,
                height: obj.height ?? this.height,
                format: obj.format ?? this.format,
            },
            obj.alt ?? this.alt,
            obj.quality ?? this.quality,
            obj.outputFormat ?? this.outputFormat
        );
    }
}

export class RemoteImage extends Image {
    constructor(url: string, width: number, height: number, alt?: string) {
        super(url, alt ?? "", width, height);
    }

    copyWith(obj: Partial<RemoteImage>): RemoteImage {
        return new RemoteImage(
            obj.src ?? this.src,
            obj.width ?? this.width,
            obj.height ?? this.height,
            obj.alt ?? this.alt
        );
    }
}
