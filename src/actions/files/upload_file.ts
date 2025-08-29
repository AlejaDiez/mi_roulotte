import { generateHash } from "@utils/crypto";
import {
    arrayBufferToStream,
    AudioTypes,
    DocumentTypes,
    ExtensionTypes,
    ImageTypes,
    streamToArrayBuffer,
    VideoTypes,
    type PartialUploadedFile
} from "@utils/file";
import { fields, filterObject } from "@utils/filter_object";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

export const uploadFile = defineAction({
    input: z.object({
        file: z
            .object({
                name: z
                    .string({
                        invalid_type_error: "file name must be a string",
                        required_error: "file name is required"
                    })
                    .nonempty("file name cannot be empty"),
                type: z.enum(
                    [
                        ...ImageTypes,
                        ...AudioTypes,
                        ...VideoTypes,
                        ...DocumentTypes
                    ] as [string, ...string[]],
                    {
                        message: "file type is not supported"
                    }
                ),
                buffer: z.instanceof(ArrayBuffer, {
                    message: "file must be an ArrayBuffer"
                })
            })
            .transform(({ name, type, buffer }) => ({
                name: name.replace(`.${ExtensionTypes[type]}`, ""),
                type,
                buffer
            })),
        transform: z
            .object({
                width: z
                    .number({
                        invalid_type_error: "width must be a number"
                    })
                    .int("width must be an integer")
                    .positive("width must be a positive number")
                    .optional(),
                height: z
                    .number({
                        invalid_type_error: "height must be a number"
                    })
                    .int("height must be an integer")
                    .positive("height must be a positive number")
                    .optional(),
                rotate: z
                    .union(
                        [
                            z.literal(0),
                            z.literal(90),
                            z.literal(180),
                            z.literal(270)
                        ],
                        {
                            message: "rotate must be one of 0, 90, 180, 270"
                        }
                    )
                    .optional(),
                quality: z
                    .number({
                        invalid_type_error: "quality must be a number"
                    })
                    .int("quality must be an integer")
                    .min(1, "quality must be at least 1")
                    .max(100, "quality must be at most 100")
                    .optional(),
                format: z
                    .enum([...ImageTypes] as any, {
                        message: "format is not supported"
                    })
                    .optional()
            })
            .optional(),
        fields
    }),
    handler: async (input, ctx): Promise<PartialUploadedFile> => {
        const { file, transform, fields } = input;
        const bucket = ctx.locals.runtime.env.BUCKET;
        const imageService = ctx.locals.runtime.env.IMAGES;
        let filePath: string = `${file.name}_${generateHash()}`;
        let fileType: string = file.type;
        let fileBuffer: ArrayBuffer = file.buffer;

        if (ImageTypes.includes(file.type)) {
            if (
                transform &&
                Object.values(transform).some((e) => e !== undefined)
            ) {
                try {
                    const img = await imageService
                        .input(arrayBufferToStream(fileBuffer))
                        .transform({
                            width: transform.width,
                            height: transform.height,
                            rotate: transform.rotate,
                            fit: "scale-down"
                        })
                        .output({
                            format: transform.format ?? file.type,
                            quality: transform.quality ?? 100
                        });

                    fileBuffer = await streamToArrayBuffer(img.image());
                    fileType = img.contentType();
                } catch (err) {
                    throw new ActionError({
                        code: "UNPROCESSABLE_CONTENT",
                        message: "image optimization failed"
                    });
                }
            }
            filePath = `images/${filePath}.${ExtensionTypes[fileType]}`;
        } else if (AudioTypes.includes(fileType)) {
            filePath = `audios/${filePath}.${ExtensionTypes[fileType]}`;
        } else if (VideoTypes.includes(fileType)) {
            filePath = `videos/${filePath}.${ExtensionTypes[fileType]}`;
        } else if (DocumentTypes.includes(fileType)) {
            filePath = `documents/${filePath}.${ExtensionTypes[fileType]}`;
        } else {
            filePath = `others/${filePath}.${ExtensionTypes[fileType]}`;
        }

        const res = await bucket.put(filePath, fileBuffer, {
            httpMetadata: {
                contentType: fileType,
                cacheControl: "public, max-age=31536000",
                contentDisposition: "inline"
            }
        });

        return filterObject(
            {
                name: res.key.split("/").pop()!,
                type: res.httpMetadata?.contentType,
                size: res.size,
                url: `${import.meta.env.SITE}/${res.key}`,
                uploadedAt: res.uploaded
            },
            fields
        );
    }
});
