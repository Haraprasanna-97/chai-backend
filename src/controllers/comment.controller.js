import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query    

    const Page = Number(page) || 1
    const Limit = Number(limit) || 10

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404,"The video you want to viewp a commnt on does not exist.")
    }

    const comments = Comment.aggregate([
        {
            $match : {
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort : {
                createdAt : 1 // Assending order
            }
        },
        {
            $skip : (Page - 1) * Limit
        },
        {
            $limit : Limit
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                comments,
                Page,
                Limit
            },
            "Comments fetched successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404,"The video you want to write a commnt on does not exist.")
    }

    const comment = req.body.comment
    if (!comment) {
        throw new ApiError(400,"Comment is required")
    }

    // Construct the document to be saved
    const document = {
        content,
        video : req.params.videoId,
        owner : req.user._id
    }

    const info = await Comment.insertMany([document])
    console.log(info);
    return res
    .status(200)
    .json(
        new ApiResponse(200,info,"Comment added")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    
    // get the comment
    const {commentId} = req.params

    // send an error message if comment does not exist
    if (!isValidObjectId(commentId)) {
        new ApiError(404,"Comment does not exist.")
    }
    
    // Save the updated comment in the database
    const info = await Comment.findByIdAndUpdate(commentId, {
        $set : {
            content : req.body.comment
        }
    })

    console.log(info);

    return res
    .status(200)
    .json(
        new ApiResponse(200,info,"Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

     // get the comment
     const {commentId} = req.params

     // send an error message if comment does not exlst
     if (!isValidObjectId(commentId)) {
         new ApiError(404,"Comment does not exist.")
     }

     // Delete the comment from the database
    const info = await Comment.findByIdAndDelete(commentId)

    console.log(info);

    return res
    .status(200)
    .json(
        new ApiResponse(200,info,"Comment updated successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }