import User from "../models/User.js";
import Video from "../models/Video.js";
import bcrypt from "bcrypt";
import fetch from 'cross-fetch';
import { token } from "morgan";


export const getJoin = (req, res) => {
    res.render("join", { pageTitle: "Join" });
};

export const postJoin = async(req, res) => { 
    const { name, username, email, password, password2, location } = req.body;
    const pageTitle = "Join"
    // password 와 password2 일치 확인.
    if(password !== password2) {
        return res.status(400).render(pageTitle, { pageTitle: "Join", errorMessage: "Password confirmation does not match.", });
    }
    // username 또는 email 이 기존에 존재하는지 확인.
    const exists = await User.exists({ $or: [{ username: username }, { email: email }] });
    if(exists) {
        return res.status(400).render(pageTitle, { pageTitle: "Join", errorMessage: "This username/email is already taken.", });
    }
    try {
        await User.create({
            name,
            username,
            email,
            password,
            password2,
            location,
            whereLogin: "Site"
        })
        req.session.successMessage = "계정이 성공적으로 생성되었습니다.";
        return res.redirect("/login");
    } catch(error) {
        console.log(`❌ (postJoin)Server-Error : \n${ error }`);
        return res.status(400).render("Join", { pageTitle: "Join", errorMessage: error._message });
    }
};

export const getLogin = (req, res) => {
    const successMessage = req.session.successMessage;
    delete req.session.successMessage;
    res.render("login", { pageTitle: "Login", successMessage });
};

export const postLogin = async(req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username: username, socialOnly: false });
    // check if account exists
    if(!user) {
        const user2 = await User.findOne({ username: username, socialOnly: true })
        // console.log('user2 : ', user2);
        if(user2) {
            return res.status(400).render("login", { pageTitle: pageTitle, errorMessage: `해당 계정은 ${user2.whereLogin}을 통해서 가입된 계정입니다. ${user2.whereLogin} 으로 로그인 부탁드립니다.` })
        }
        return res.status(400).render("login", { pageTitle: pageTitle, errorMessage: "An account with this username does not exists." })
    }
    // check if password correct
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        return res.status(400).render("login", { pageTitle: pageTitle, errorMessage: "Wrong password" });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    // console.log('START_FINAL_URL : ', finalUrl);
    return res.redirect(finalUrl);
};

export const finishGithubLogin = async(req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    // console.log('FINISH_FINAL_URL : ', finalUrl);
    const tokenRequest = await(
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })).json();
        // console.log("tokenRequest : ", tokenRequest);
        // res.send(JSON.stringify(json));
        if("access_token" in tokenRequest) {
            const access_token = tokenRequest.access_token;
            const apiUrl = "https://api.github.com";
            const userData = await(await fetch(`${apiUrl}/user`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })).json();
            // console.log(userData);
            const emailData = await(await fetch(`${apiUrl}/user/emails`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })).json();
            // console.log('emailData : ', emailData);
            const emailObj = emailData.find(
                (email) => email.primary === true && email.verified === true
                );
                if(!emailObj) {
                    return res.redirect("/login");
                }
                let user = await User.findOne({ email: emailObj.email });
                // console.log('user : ', user);
                if(!user) {
                    // console.log("Github 계정 생성")
                    user = await User.create({
                        avatarUrl: userData.avatar_url,
                        name: userData.name ? userData.name : userData.login,
                        username: emailObj.email.split('@')[0] ? emailObj.email.split('@')[0] : userData.login,
                        // username: userData.login,
                        email: emailObj.email,
                        password: "",
                        socialOnly: true,
                        whereLogin: "Github",
                        location: userData.location ? userData.location : "Unknown",
                    });
                    // console.log("user : ", user);
                } 
                req.session.loggedIn = true;
                req.session.user = user;
                return res.redirect("/");
            } else {
                return res.redirect("/login");
            }
};
        
export const startNaverLogin = (req, res) => {
    // 로그인 연동 URL 생성
    const apiUrl = "https://nid.naver.com/oauth2.0/authorize";
    const config = {
        response_type: "code",
        client_id: process.env.NAV_CLIENT,
        redirect_uri: encodeURI("http://localhost:4000/users/naver/second"),
        state: process.env.NAV_STATE
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${apiUrl}?${params}`;
    // console.log("FIRST_finalUrl : ", finalUrl);
    return res.redirect(finalUrl);
};

export const finishNaverLogin = async(req, res) => {
    const code = req.query.code;
    
    // 접근 토큰 발급 요청
    const apiUrl = "https://nid.naver.com/oauth2.0/token";
    const config = {
        grant_type: "authorization_code",
        client_id: process.env.NAV_CLIENT,
        client_secret: process.env.NAV_SECRET,
        code: code,
        state: process.env.NAV_STATE,
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${apiUrl}?${[params]}`;
    // console.log("SECOND_finalUrl : ", finalUrl);
    const tokenRequest = await(await fetch(finalUrl, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    })).json();
    // console.log('tokenRequest : ', tokenRequest);
    
    if("access_token" in tokenRequest) {
        // 프로필 정보 조회
        const apiUrl2 = "https://openapi.naver.com/v1/nid/me";
        const access_token = tokenRequest.access_token;
        // console.log('access_token : ', access_token);
        const userData = await(await fetch(apiUrl2, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${access_token}`,
            },
        })).json();
        // console.log('userData : ', userData);
        let user = await User.findOne({ email: userData.response.email })
        if(!user) {
            user = await User.create({
                avatarUrl: userData.response.profile_image,
                name: userData.response.name,
                username: userData.response.email.split('@')[0],
                email: userData.response.email,
                password: "",
                socialOnly: true,
                whereLogin: "Naver",
                location: "Unknown",
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};
      
export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" })
};

export const postEdit = async(req, res) => {
    // Case 1
    // const id = req.session.user._id;
    // Case 2
    const { 
        session: { 
            user: { 
                _id,
                avatarUrl,
            } 
        }, 
        body: {
            name, 
            email, 
            username, 
            location 
        },
        file,
    } = req; 
    console.log("FILE : ", file);
    const pageTitle = 'Edit Profile';
    const user = await User.findById(_id);
    // console.log("postEditUser : ", user);
    if(user.socialOnly == true) {
        return res.status(400).render("edit-profile", { 
            pageTitle: "Edit Profile", 
            errorMessage: `${user.whereLogin}을 통해 생성된 계정입니다. ${user.whereLogin}에서 수정해주세요.` 
        })
    }
    const currentUser = req.session.user;
    // console.log('currentUser : ', currentUser);
    if (currentUser.email !== email && (await User.exists({ email }))) {
        return res.status(400).render('edit-profile', {
        pageTitle,
        errorMessage: 'This email is already taken.',
        });
    }
    if (currentUser.username !== username && (Boolean(await User.exists({ username })))) {
        // console.log("현재 세션의 username과 입력한 username이 다르면서, 입력한 username이 존재한다면?")
        return res.status(400).render('edit-profile', {
        pageTitle,
        errorMessage: 'This username is already taken.',
        });
    }
    // console.log("Before Update");
    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? file.path : avatarUrl,     
        name: name,
        email: email,
        username: username,
        location: location 
    }, { 
        new: true 
    })
    // Case 1
    req.session.user = {
        ...req.session.user,
        avatarUrl: file ? file.path : avatarUrl,    
        name: name,
        email: email,
        username: username,
        location: location,
    }
    // Case 2
    // req.session.user = updatedUser
    // console.log("updatedUser : ", updatedUser);
    return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
    return res.render("./user/change-password", { 
        pageTitle: "Change Password" 
    })
};

export const postChangePassword = async(req, res ) => {
    const { 
        session: {
            user: {_id, password},
        },
        body: { oldPassword, newPassword, newPasswordConfirmation } 
    } = req;
    const ok = await bcrypt.compare(oldPassword, password);
    if(!ok) {
        return res.status(400).render("user/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect"
        })
    }
    ("user/change-password", { pageTitle: "Change Password", errorMessage: "The current password is incorrect" })
    if(newPassword !== newPasswordConfirmation) {
        // console.log("새로운 비밀번호 2차 검증")
        return res.status(400).render("./user/change-password", { pageTitle: "Change Password", errorMessage: "The password does not match the confirmation." });
    }
    const user = await User.findById(_id);
    user.password = newPassword;
    await user.save(); 
    req.session.user.password = user.password;
    // send notification
    return res.redirect("/users/logout");
};

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

export const see = async(req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("videos");
    console.log('USER : ', user);
    if(!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
    // const videos = await Video.find({ owner: user._id }); 
    // console.log('VIDEOS : ', videos);
    return res.render("user/profile", { pageTitle: `${user.name}`, user })  // videos.owner
};
