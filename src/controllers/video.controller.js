import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ThumbnailFolderName, VideoFolderName } from "../constants.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    // Check if title and description are provided in request body
    if (!(title || description)) {
        throw new ApiError(400, "title and description in required")
    }

    // Check if video file is provided in the request
    let videoLocalPath

    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoLocalPath = req.files.videoFile[0].path
    }

    // Send an error message if video file is not sent by the user
    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is requitred")
    }

    // Check if thumbnail file is provided in the request
    let thumbnailLocalPath

    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    // Send an error message if thumbnail file is not sent by the user
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thunbnail file is requitred")
    }

    // Uplod video file to cloudinarry
    const videoFile = await uploadOnCloudinary(VideoFolderName, videoLocalPath)

    // Uplod thumbnail file to cloudinarry
    const thumbnail = await uploadOnCloudinary(ThumbnailFolderName, thumbnailLocalPath)

    // Create an object whic will be saved to the database   
    const videoDetailsToSave = {
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: Math.floor(videoFile.duration),
        owner: req.user._id
    }

    // Save the user object to database
    const videoDetails = await Video.create(videoDetailsToSave)

    if (!videoDetails) {
        throw new ApiError(500, "Video publishing failed")
    }

    // send the uswe details in response
    return res
        .status(201)
        .json(
            new ApiResponse(201, videoDetails, "Video publihed successfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // Send an error message if userId is invalid
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "The video you want to access does not exist")
    }

    // Get user from the database
    const videoDetails = await Video.findById(videoId)

    // If details is not available send an error message
    if (!videoDetails) {
        throw new ApiError(400, "The video you want to access does not exist")
    }

    // Send the viodeo details
    return res.status(200)
        .json(
            new ApiResponse(200, videoDetails, "Video details fetched succesfully")
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    // Send an error message if videoId is invalid
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "The video you want to modify the details of does not exist");
    }

    const { title, description } = req.body

    // Send an error message if title and description are not provided in request body
    if (!(title || description)) {
        throw new ApiError(400, "Title and description is required")
    }

    // Get the thumbnailLocalPath with the file recived from the request
    let thumbnailLocalPath = req.file?.path

    // Send an error meassage if thumbnail is not provided in request files
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }

    // Upload new thumbnail to cloudinaeey
    const thumbnail = await uploadOnCloudinary(ThumbnailFolderName, thumbnailLocalPath)

    // Send an error message when thumbnail does not contain an URL
    if (!thumbnail.url) {
        throw new ApiError(500, "Thumbnail update failed please try again layter")
    }

    // get the URL of the old thumbnail
    const thumbnailFromDB = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $project: {
                _id: 0,
                thumbnail: 1
            }
        }
    ])

    const oldThumbnail = thumbnailFromDB[0].thumbnail

    // Create an object to save the new deetails
    const newDetails = {
        thumbnail: thumbnail.url,
        title,
        description
    }

    const updatedDetails = await Video.findByIdAndUpdate(videoId, newDetails,
        {
            new: true
        }
    )

    await deleteFromCloudinary(ThumbnailFolderName, oldThumbnail)

    return res
    .status(200)
    .json(new ApiResponse(200, updatedDetails, "Video details updated succesfully."))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    // Send an error message if videoId recived is invalid
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "The video you want to access does not exist")
    }

    // Get the thumbnail and videoFile obtained after deleting the specific video infornation from the database
    const deletedVideoInfo = await Video.findByIdAndDelete(videoId, {
        projection: {
            thumbnail: 1,
            videoFile: 1,
            _id: 0
        }
    })

    // Send an error message if video is does not exist
    if (!deletedVideoInfo) {
        throw new ApiError(400, "The video you want to delrte does not exist")
    }

    const { thumbnail, videoFile } = deletedVideoInfo

    // Using the thunbnail and videoFile recived in the previous step, delete the assets from cloudinarry
    const thumbnailDeltedResponse = await deleteFromCloudinary(ThumbnailFolderName, thumbnail)
    const videoFileDeltedResponse = await deleteFromCloudinary(VideoFolderName, videoFile)

    // Construct a message to be sent to frontend
    let meassage = "Failed to delete video"
    
    if (thumbnailDeltedResponse.result == "ok" && videoFileDeltedResponse.result == "ok") {
        meassage = "Video deleted successfully"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, meassage)
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}