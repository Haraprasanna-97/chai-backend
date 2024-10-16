import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})

connectDB()
.then(() => {
    let port = process.env.PORT || 8000

    app.on("error",(error) => {
        console.log("ERROR ", error);
        throw error
    })
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`)
    })
})
.catch((error) => {
    console.log("MONGODB connection failed !!!", error)
})