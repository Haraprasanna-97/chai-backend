import mongoose, { isValidObjectId, Types } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggle = async (filter, Insert) => {
    let document

    // Add / remove the itrmId in the video field of the like schema
    document = await Like.findOneAndDelete(filter)

    if (!document) {
        document = await Like.insertMany([Insert])
    }

    return document
}

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    // Send an error message if VideoId is invalid
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "The video you want to like does not exist")
    }

    const resultingDocument = await toggle({
        video: new mongoose.Types.ObjectId(videoId)
    },
        {
            video: new mongoose.Types.ObjectId(videoId),
            likedBy: new mongoose.Types.ObjectId(req.user._id)
        })

    const liked = Array.isArray(resultingDocument)
    const message = liked ? "Like added" : "Like removed"

    // send a response eth liked set to true
    return res
        .status(200)
        .json(
            new ApiResponse(200, { liked }, message)
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    // Send an error message if commentId is invalid
    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "The comment you want to like doe not exist")
    }

    const resultingDocument = await toggle({
        comment: new mongoose.Types.ObjectId(commentId)
    },
        {
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: new mongoose.Types.ObjectId(req.user._id)
        })

    const liked = Array.isArray(resultingDocument)
    const message = liked ? "Like added" : "Like removed"

    // send a response eth liked set to true
    return res
        .status(200)
        .json(
            new ApiResponse(200, { liked }, message)
        )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    // Send an error message if tweetId is invalid
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "The tweet you want to like doea not exist")
    }

    const resultingDocument = await toggle(
        {
            tweet: new mongoose.Types.ObjectId(tweetId)
        },
        {
            tweet: new mongoose.Types.ObjectId(tweetId),
            likedBy: new mongoose.Types.ObjectId(req.user._id)
        })

    const liked = Array.isArray(resultingDocument)
    const message = liked ? "Like added" : "Like removed"

    // send a response eth liked set to true
    return res
        .status(200)
        .json(
            new ApiResponse(200, { liked }, message)
        )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $sort: {
                updatedAt: 1
            }
        }
    ])

    // Send the response
    return res
        .status(200)
        .json(
            new ApiResponse(200,
                {
                    likedVideos,
                    likedVideosCount: likedVideos.length
                }
            )
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}