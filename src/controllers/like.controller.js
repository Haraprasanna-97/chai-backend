import mongoose, { isValidObjectId, Types } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    // Send an error message if VideoId is invalid
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "The video you want to like doe not exist")
    }

    // Add / remove the videoId in the video field of the like schema
    const videoToLike = await Like.findOne({
        video: new mongoose.Types.ObjectId(videoId),
    })

    let info

    if (!videoToLike) {
        info = await Like.insertMany([
            {
                video: new mongoose.Types.ObjectId(videoId),
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        ])
    }
    else {
        info = await Like.deleteOne({
            video: new mongoose.Types.ObjectId(videoId),
        })
    }

    // send a response eth liked set to true
    return res
        .status(200)
        .json(
            new ApiResponse(200, info, "The video has been liked by you")
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}