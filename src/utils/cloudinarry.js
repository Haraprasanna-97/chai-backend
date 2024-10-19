import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (folder_name, localFilePath) => {
    try {
        if (!localFilePath) return null
        //  Uplad a file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folder_name
        })

        // File has been uploaded on clodinary successfully
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

const deleteFromCloudinary = async (folder_name, mediaURL) => {
    if (!mediaURL) return null

    try {
        const filename = extractFileNameFromUrl(folder_name, mediaURL)
    
        const response = await cloudinary.uploader.destroy(`${folder_name}/${filename}`) // Filename is the publicID
        console.log(response);
    
        return response
    }
    catch (error) {
        console.error('Error while deleting media from Cloudinary:', error);
        return null
    }
}

const extractPublicIdFromUrl = (url) => {
    // Assuming the URL is in the format: https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>.<format>
    const parts = url.split('/');
    const publicIdWithFormat = parts[parts.length - 1];
    const publicId = publicIdWithFormat.split('.')[0]; // Remove the file extension
    return publicId;
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}