import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter"; 
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware } from "./middlewares";


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


// session 미들웨어 추가
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false, 
    saveUninitialized: false,  // 세션을 수정할 때만 세션을 DB에 저장하고 쿠키를 넘겨주는거다.
    // cookie: {
    //     maxAge: 20000,  // 20초 동안 쿠키를 가지고 있는다.
    // },
    store: MongoStore.create({mongoUrl: process.env.DB_URL})
    })
);

app.use(localsMiddleware)

// Router
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

export default app;



