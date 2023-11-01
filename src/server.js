import "./db";  // db.js 자체를 import
import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter"; 
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";


const PORT = 4000;

// Create  express App/Server
const app = express();

// ##########################################################################

/** morgan 호출 및 옵션 설정(combined, common, dev, short, tiny) */
const logger = morgan("dev");

// Express에게 view engine을 pug를 사용하도록 설정.
app.set("view engine", "pug");

// Express에게 views 를 process.cwd() + "/src/views" 경로로 설정.  
app.set("views", process.cwd() + "/src/views");

// Global Middleware
app.use(logger);

// Express 에게 form의 value들을 이해할 수 있도록 하고, 자바스크립트 형식으로 변형.
app.use(express.urlencoded({ extended: true }));

// Root Router
app.use("/", globalRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);


const handleListening = () => console.log(`Server listening on http://localhost:${PORT}`);

// Running App/Server listen(port, callback)
app.listen(PORT, handleListening)


