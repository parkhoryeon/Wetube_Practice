import Video from "../models/video.js";


export const home = async(req, res) => {
    try {
        const videos = await Video.find({});
        console.log("⭐ videos : ", videos);
        return res.render("home", { pageTitle: "Home", videos: videos });
    } catch(error) {
        return res.render("❌ Server-Error", { error });
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
export const postEdit = (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
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
            hashtags: hashtags.split(",").map((word) => { return `#${ word }`}),
        });
        await video.save();
        console.log(`⭐ Saved Video : `, await video.save());
        return res.redirect("/");
    } catch(error) {
        console.log(`❌ Server-Error : \n${ error }`);
        return res.render("Upload", { pageTitle: "Upload Video", errorMessage: error._message });
    }
};