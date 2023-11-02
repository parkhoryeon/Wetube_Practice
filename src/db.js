import mongoose from "mongoose";

/** mongoose 와 mongodb 연결1 */
mongoose.connect("mongodb://127.0.0.1:27017/wetube",
// ??_??
// useNewUrlParser: true,
// userUnifiedTopology: true,
);

/** mongoose 와 mongodb 연결2 */
const db = mongoose.connection;

// DB Error 발생 시 이벤트
const handleError = () => {
    console.log("❌ DB Error", error);
}
// DB Open 발생 시 이벤트
const handleOpen = () => {
    console.log("⭕ Connected to DB");
}

db.on("error", handleError);  // 여러 번 발생 이벤트
db.once("open", handleOpen);  // 한 번 발생 이벤트