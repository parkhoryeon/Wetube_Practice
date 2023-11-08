import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String },
    socialOnly: { type: Boolean, default: false },
    // whereLogin 어떤 것으로 가입을 했는지를 확인하기 위해(?) 
    whereLogin: { type: String, required: true }, 
    username: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    location: String,
});

userSchema.pre('save', async function() {
    console.log("User password : ", this.password);
    this.password = await bcrypt.hash(this.password, 5);
    console.log("Hashed password", this.password);
})

/** Video 모델 생성 / mongoose와 model 연결 */
const User = mongoose.model("User", userSchema);

export default User;