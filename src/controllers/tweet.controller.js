import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    if (!req.body.content) {
        throw new ApiError(400, "content is required")
    }

    let tweet = {
        owner: req.user._id,
        content: req.body.content
    }

    const inserted = await Tweet.insertMany([tweet])

    return res
        .status(200)
        .json(
            new ApiResponse(200, inserted, "Tweet fetched successfully")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const { userId } = req.params


    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    let tweets = await Tweet.aggregate([
        {
            '$lookup': {
                'from': 'users',
                'localField': 'owner',
                'foreignField': '_id',
                'as': 'ownerDetails'
            }
        },
        {
            '$unwind': '$ownerDetails'
        },
        {
            '$match': {
                'owner': new mongoose.Types.ObjectId(userId)
            }
        },
        {
            "$addFields": {
                "username": "$ownerDetails.username",
                "avatar": "$ownerDetails.avatar"
            }
        },
        {
            '$project': {
                'content': 1,
                'username': 1,
                'avatar': 1,
                'createdAt': 1,
                'updatedAt': 1,
                '_id': 0
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, { tweets }, "Fetched all tweets")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    let tweet = {
        content: req.body.content
    }

    let tweetId = req.params.tweetId

    let status = await Tweet.updateOne({
        _id: new mongoose.Types.ObjectId(tweetId)
    }, tweet)

    return res
        .status(200)
        .json(
            new ApiResponse(200, { status }, "Tweet updated")
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    let tweetId = req.params.tweetId

    let status = await Tweet.deleteOne({
        _id: new mongoose.Types.ObjectId(tweetId)
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, { status }, "Tweet deleted")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}