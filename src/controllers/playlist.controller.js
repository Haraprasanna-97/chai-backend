import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    let info = await Playlist.insertMany([{
        name,
        description,
        owner: req.user._id
    }])

    let id = info[0]._id

    return res
        .status(200)
        .json(
            new ApiResponse(200,{id},"Playlist created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "The video you want to like does not exist")
    }

    let playlist = await Playlist.findById(playlistId)

    return res
        .status(200)
        .json(
            new ApiResponse(200,playlist,"Playlist fetched successfuly")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "The video you want to like does not exist")
    }

    let info = await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(
            new ApiResponse(200,info,"Playlist deleted successfuly")
        )    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}