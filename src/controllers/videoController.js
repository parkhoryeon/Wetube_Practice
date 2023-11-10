import Video from "../models/Video.js";
import User from "../models/User.js";


export const home = async(req, res) => {
    try {
        const videos = await Video.find({}).sort({createdAt: "desc"});
        // console.log("⭐ (home)videos : ", videos);
        return res.render("home", { pageTitle: "Home", videos: videos });
    } catch(error) {
        return res.status(400).render("❌ (home)Server-Error", { error });
    };
};
export const watch = async(req, res) => {
    const { id } = req.params;
    const video = await  Video.findById(id).populate("owner");
    // const owner = await User.findById(video.owner);
    console.log("VIDEO : ", video);
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    return res.render("watch", { pageTitle: video.title, video: video,  });  // owner
};
export const getEdit = async(req, res) => {
    const { id } = req.params;
    const { user: {_id} } = req.session;
    const video = await Video.findById(id)
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." })
    }
    console.log("VIDEO.OWNER : ", video.owner),
    console.log("_ID : ", _id);
    if(String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("edit", { pageTitle: `Edit: ${video.title}`, video: video });
};
export const postEdit = async(req, res) => {
    const {
        user: { _id },
    } = req.session;
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.title;
    const hashtags = req.body.hashtags;
    const video = await Video.exists({ _id: id });
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
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
    const {
        session: {
            user: _id
        },
        body: { title, description, hashtags },
        file,
    } = req;
    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl: file.path,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        // const video = new Video({
        //     title: title,
        //     description: description,
        //     fileUrl: file.path,
        //     owner: _id,
        //     hashtags: Video.formatHashtags(hashtags),
        // });
        // await video.save();
        // console.log(`⭐ (postUpload)Saved Video : `, video);
        return res.redirect("/");
    } catch(error) {
        console.log(`❌ (postUpload)Server-Error : \n${ error }`);
        return res.status(400).render("Upload", { pageTitle: "Upload Video", errorMessage: error._message });
    }
};

export const deleteVideo = async(req, res) => {
    // const { id } = req.params;
    const {
        session: {
            user: { _id }
        },
        params: {id}
    } = req;
    const video = await Video.findById(id);
    if(!video) {
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
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