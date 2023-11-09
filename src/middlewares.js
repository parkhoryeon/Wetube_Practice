import multer from 'multer';

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};
    console.log("localsMiddleware : ", res.locals);
    next();
}


export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/login")
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/")
    }
}

// 사용자가 보낸 파일을 uploads 폴더에 저장하도록 설정된 middleware.
export const avatarUpload = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 3000000
    }
})

export const videoUpload = multer({ 
    dest: "uploads/videos/",
    limits: {
        fileSize: 10000000,
    }
 })