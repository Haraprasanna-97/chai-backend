import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channal ID")
    }

    const doc = {
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: new mongoose.Types.ObjectId(req.user?._id)
    }

    const DocCount = await Subscription.aggregate([
        {
            '$match': doc
        },
        {
            '$project': { '_id': 0 }
        },
        {
            '$count': 'count'
        }
    ])

    if (DocCount[0]?.count === 1) {
        await Subscription.deleteOne(doc)
        return res
            .status(200)
            .json(
                new ApiResponse(200, {subscribed : false}, "Unsubscribed")
            )
    }
    else {
        await Subscription.insertMany([doc])
        return res
        .status(200)
        .json(
            new ApiResponse(200, {subscribed : true}, "Subscribed")
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}