import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const CLOUD_FOLDER = process.env.CLOUDINARY_FOLDER

export const uploadToCloudinary = async (
    buffer: Buffer,
    filename: string,
    folder: string
): Promise<{ url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: `${CLOUD_FOLDER}/${folder}`, // nested folder path
                public_id: filename.split('.').slice(0, -1).join(''),
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) return reject(error);
                if (result) {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            }
        ).end(buffer);
    });
};

// Extracts full public_id (including folder path) from a Cloudinary URL
const getPublicIdFromUrl = (url: string): string | null => {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(\.[a-zA-Z0-9]+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export const deleteFromCloudinary = async (fileUrl: string): Promise<boolean> => {
    const publicId = getPublicIdFromUrl(fileUrl);
    if (!publicId) return false;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === "ok"; // Cloudinary returns { result: "ok" } on success
    } catch (error) {
        console.error("Failed deletion from Cloudinary:", error);
        return false;
    }
};
