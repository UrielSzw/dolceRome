//Base de Datos
const db = require('../database/models');

//Express Validator
const { validationResult } = require('express-validator');

//Brcypts JS Hashing
const bcrypts = require('bcryptjs');

//Controlador
const controller = {
    registerForm: (req, res)=> {
        res.render('register');
    },
    loginForm: (req, res)=> {
        res.render('login');
    },
    createUser: (req, res)=> {
        const validations = validationResult(req);
        console.log(validations.mapped())
        if(validations.errors.length > 1 || validations.errors.length == 1 && validations.mapped().img.msg != 'The "path" argument must be of type string. Received an instance of Object') {
            return res.render('register', { errors: validations.mapped(), oldData: req.body })
        }

        let userInDB = ()=> {
            db.Users.findOne({ where: { email: req.body.email }, attributes: {exclude: ['img']} })
                .then(result => {
                    if(result) {
                        return res.render('register', { errors: { email: { msg: 'El email ya se encuentra registrado' } }, oldData: req.body })
                    }

                    db.Users.create({
                        name: req.body.name,
                        email: req.body.email,
                        img: req.file.filename,
                        password:  bcrypts.hashSync(req.body.password, 10)
                    });
                    return res.redirect('/user/login');
                })
                .catch(error => {
                    console.log(error);
                    res.send(error);
                });
        }
        userInDB();
    },
    loginInto: (req, res)=> {
        let loginUser = ()=> {
            db.Users.findOne({ where: { email: req.body.email } })
                .then(result => {
                    if(!result) {
                        return res.render('login', { errors: { email: { msg: 'Credenciales invalidas' } } });
                    }
                    
                    if(bcrypts.compareSync(req.body.password, result.password)) {
                        req.session.userLogged = result.dataValues;
                        
                        if(req.body.remember != undefined) {
                            res.cookie('remember', userLogged.email, { maxAge: 60000 });
                        }

                        req.session.admin = false;
                        if(req.session.userLogged.id === 8){
                            req.session.admin = true;
                        }

                        return res.redirect('/user/profile');
                    } else {
                        return res.render('login', { errors: { email: { msg: 'Credenciales invalidas' } } })
                    }
                })
                .catch(error => {
                    console.log(error);
                    res.send(error);
                });
        }
        loginUser();
    },
    profile: (req, res)=> {
        res.render('profile', { user: req.session.userLogged });
    },
    logout: (req, res)=> {
        req.session.destroy();
        res.clearCookie('remember');
        res.redirect('/');
    }
}

module.exports = controller;