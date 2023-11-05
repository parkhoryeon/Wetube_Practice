import mongoose from "mongoose";

// export const formatHashtags = (hashtags) =>
//     hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`))

/** 비디오 스키마(데이터의 생김새) */
const videoSchema = new mongoose.Schema({
    title: { type: String, default: 0, uppercase: true, trim: true, maxLength: 80, required: true },
    description: { type: String, default: 0, trim: true, minLength: 20, required: true },
    createdAt: { type: Date, default: Date.now, required: true },  // Date.now() --> Date.now 로 해주는것은 바로 실행을 시키지 않기 위해서.
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, default: 0, required: true },
        rating: { type: Number, default: 0, required: true }
    },
});

videoSchema.static('formatHashtags', function(hashtags) {
    return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`))
});

// videoSchema.pre('save', async function() {
//     this.hashtags = this.hashtags[0]
//         .split(",")
//         .map((word) => { return word.startsWith('#') ? word : `#${ word }`})
// })

/** Video 모델 생성 / mongoose와 model 연결 */
const Video = mongoose.model("Video", videoSchema);

export default Video;