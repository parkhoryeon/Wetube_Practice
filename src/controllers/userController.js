import User from "../models/User.js";
import bcrypt from "bcrypt";
import fetch from 'cross-fetch';


export const getJoin = (req, res) => {
    res.render("join", { pageTitle: "Join" });
}
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
        })
        return res.redirect("/login");
    } catch(error) {
        console.log(`❌ (postJoin)Server-Error : \n${ error }`);
        return res.status(400).render("Join", { pageTitle: "Join", errorMessage: error._message });
    }
}
export const getLogin = (req, res) => {
    res.render("login", { pageTitle: "Login" });
}
export const postLogin = async(req, res) => {
    const { username, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ username: username });
    // check if account exists
    if(!user) {
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
}

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    // console.log('FINAL_URL : ', finalUrl);
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
    // console.log('FINAL_URL : ', finalUrl);
    const tokenRequest = await(
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })).json();
    // console.log(json);
    // res.send(JSON.stringify(json));
    if("access_token" in tokenRequest) {
        const access_token = tokenRequest.access_token;
        const userRequest = await(await fetch("https://api.github.com/user", {
            Authorization: `token ${access_token}`
        })).json();
        console.log(userRequest);
    } else {
        return res.redirect("/login");
    }
};


export const edit = (req, res) => {
    res.send("Edit User");
}
export const remove = (req, res) => {
    res.send("Remove User");
}
export const logout = (req, res) => {
    res.send("Log Out");
}
export const see = (req, res) => {
    res.send("See User");
}