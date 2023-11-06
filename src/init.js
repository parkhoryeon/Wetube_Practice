import "./db";  // db.js 자체를 import
import "./models/Video";
import "./models/User";
import app from "./server";

const PORT = 4000;

const handleListening = () => {
    console.log(`⭕ Server listening on http://localhost:${PORT}`);
}
// Running App/Server listen(port, callback)
app.listen(PORT, handleListening)
