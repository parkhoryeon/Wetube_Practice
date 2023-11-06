import User from "../models/User.js";
import bcrypt from "bcrypt";


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
export const edit = (req, res) => {
    res.send("Edit User");
}
export const remove = (req, res) => {
    res.send("Remove User");
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
export const logout = (req, res) => {
    res.send("Log Out");
}
export const see = (req, res) => {
    res.send("See User");
}