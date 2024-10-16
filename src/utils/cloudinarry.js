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
            resource_type: "auto" ,
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

export {uploadOnCloudinary}