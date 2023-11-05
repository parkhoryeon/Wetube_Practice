import Video from "../models/video.js";


export const home = async(req, res) => {
    try {
        const videos = await Video.find({}).sort({createdAt: "desc"});
        console.log("⭐ (home)videos : ", videos);
        return res.render("home", { pageTitle: "Home", videos: videos });
    } catch(error) {
        return res.render("❌ (home)Server-Error", { error });
    };
};
export const watch = async(req, res) => {
    const id = req.params.id;
    const video = await Video.findById(id);
    if(!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    return res.render("watch", { pageTitle: video.title, video: video });
};
export const getEdit = async(req, res) => {
    const id = req.params.id;
    const video = await Video.findById(id)
    if(!video) {
        return res.render("404", { pageTitle: "Video not found." })
    }
    return res.render("edit", { pageTitle: `Edit: ${video.title}`, video: video });
};
export const postEdit = async(req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.title;
    const hashtags = req.body.hashtags;
    const video = await Video.exists({ _id: id });
    if(!video) {
        return res.render("404", { pageTitle: "Video not found." });
    }
    await Video.findByIdAndUpdate(id, {
        title: title,
        description: description,
        hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect(`/videos/${id}`);
};
export const getUpload = (req, res) => {
    return res.render("Upload", { pageTitle: "Upload Video" });
};
export const postUpload = async(req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const hashtags = req.body.hashtags;
    try {
        const video = new Video({
            title: title,
            description: description,
            hashtags: Video.formatHashtags(hashtags),
        });
        await video.save();
        console.log(`⭐ (postUpload)Saved Video : `, video);
        return res.redirect("/");
    } catch(error) {
        console.log(`❌ (postUpload)Server-Error : \n${ error }`);
        return res.render("Upload", { pageTitle: "Upload Video", errorMessage: error._message });
    }
};

export const deleteVideo = async(req, res) => {
    const id = req.params.id;
    await Video.findByIdAndDelete(id);
    // delete video
    return res.redirect("/");
};


export const search = async(req, res) => {
    const keyword = req.query.keyword;
    console.log('⭐ Should search for ', keyword)
    if(keyword) {
        const videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i"),
            },
        })
        return res.render("Search", { pageTitle: "Search", videos: videos })
    }
    return res.render("Search", { pageTitle: "Search" });
};