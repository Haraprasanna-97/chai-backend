class ApiError extends Error{
    constructor(
        stattusCode,
        message = "something went wrong",
        errors = [],
        stack = ""
        
    ){
        super(message)
        this.stattusCode = stattusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
        
    }
}

export {ApiError}