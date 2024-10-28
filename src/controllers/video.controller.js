import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ThumbnailFolderName, VideoFolderName } from "../constants.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
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
    const thumbnail =  await uploadOnCloudinary(ThumbnailFolderName, thumbnailLocalPath)

    // Create an object whic will be saved to the database   
    const videoDetailsToSave = {
        title,
        description,
        videoFile : videoFile.url,
        thumbnail : thumbnail.url,
        duration : Math.floor(videoFile.duration),
        owner : req.user._id
    }
    
    // Save the user object to database
    const videoDetails = await Video.create(videoDetailsToSave)

    if (!videoDetails) {
        throw new ApiError(500,"Video publishing failed")
    }

    // send the uswe details in response
    return res
    .status(201)
    .json(
        new ApiResponse(201,savedData,"Video publihed successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // Get user from the database
    const videoDetails = await Video.findById(videoId)

    // If details is not available send an error message
    if(!videoDetails){
        throw new ApiError(500,"Unable to fetch video details")
    }

    // Send the vodeo details
    return res.status(200)
    .json(
        new ApiResponse(200,videoDetails,"Video details fetched succesfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
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