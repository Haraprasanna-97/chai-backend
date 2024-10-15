import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js" 
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinarry.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // Get user data from frontend
    // Validation - not empty
    // Check if user exists: username, email
    // Check for images, check for avtar
    // Upload them to cloudinarry, awtar
    // Create user object - create entry in DB
    // Remove password and refresh token field from respons
    // Check for user creation
    // Return response

    const {username, email, fullName,  password} = req.body
    console.log(`password : ${password}`);
    
    if ([fullName, username, email, password].some((field) => field?.trim())) {
        throw new ApiError(400,"All fieelds are required")
    }

    const existedUser = User.findOne({
        $or:[{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, `User with ${username} or ${email} already exists`)
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: avatarcoverImage?.url || "",
        email,
        password,
        username: username.toLowerCase
    })

    const createdUser = await user.findByID(User._id).select("-passwotd -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    res.status(201).json(
        new ApiResponse(201, createdUser, "User registration successful")
    )

})

export { registerUser }