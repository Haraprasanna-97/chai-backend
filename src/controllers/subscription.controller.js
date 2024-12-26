import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { json } from "express"


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
                new ApiResponse(200, { subscribed: false }, "Unsubscribed")
            )
    }
    else {
        await Subscription.insertMany([doc])
        return res
            .status(200)
            .json(
                new ApiResponse(200, { subscribed: true }, "Subscribed")
            )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channal ID")
    }

    const subscriberList = await Subscription.aggregate([
        {
            '$match': {
                'channel': new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'subscriber',
                'foreignField': '_id',
                'as': 'subscriber',
                'pipeline': [
                    {
                        '$project': {
                            '_id': 0,
                            'avatar': 1,
                            'fullName': 1
                        }
                    }
                ]
            }
        },
        {
            '$project': {
                '_id': 0,
                'subscriber': 1
            }
        },
        {
          $unwind: "$subscriber"
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscriberList, "Subscriber list fetched successfully")
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const channelList = await User.aggregate([
        {
            '$lookup': {
                'from': 'subscriptions',
                'localField': '_id',
                'foreignField': 'subscriber',
                'as': 'SubscribedTo'
            }
        },
        {
            '$unwind': {
                'path': '$SubscribedTo'
            }
        },
        {
            '$match': {
                'SubscribedTo.subscriber': new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            '$addFields': {
                'SubscribedTo': '$SubscribedTo.channel'
            }
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'SubscribedTo',
                'foreignField': '_id',
                'as': 'SubscribedTo',
                'pipeline': [
                    {
                        '$project': {
                            'email': 1,
                            'fullName': 1,
                            'avatar': 1,
                            'username': 1
                        }
                    }
                ]
            }
        },
        {
            '$project': {
                '_id': 0,
                'SubscribedTo': 1
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, channelList, "Channel list fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}