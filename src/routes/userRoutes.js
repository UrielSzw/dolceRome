//Modulos Node JS
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

//Multer
const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, '../public/images/profiles');
    },
    filename: (req, file, cb)=> {
        cb(null, `img_${Date.now()}_${path.extname(file.originalname)}`);
    }
});

const uploadFile = multer({ storage });

//Express Validator
const { check } = require('express-validator');

const validations = [
    check('name').notEmpty().withMessage('Debes completar el nombre'),
    check('email').notEmpty().withMessage('Debes completar el email').bail().isEmail().withMessage('Debes completar un email valido'),
    check('img').custom((value, filename)=> {
        var extension = (path.extname(filename)).toLowerCase();
        switch (extension) {
            case '.jpg':
            case '.jpeg':
            case  '.png':
                return true;
            default:
                throw new Error('Debes subir imagen en formato JPG, JPEG o PNG');
        }
    }),
    check('password').notEmpty().withMessage('Debes completar la contraseña'),
    check('repassword').custom((value, { req }) => {
        if(value !== req.body.password) {
            throw new Error('Las contraseñas deben coincidir');
        } else {
            return true;
        }
    })
];

//Middleware
const guestMiddleware = require('../middlewares/guestMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

//Rutas
const userController = require('../controllers/userController');

router.get('/register', guestMiddleware, userController.registerForm);
router.get('/login', guestMiddleware, userController.loginForm);
router.post('/register', uploadFile.single('img'), validations, userController.createUser);
router.post('/login', userController.loginInto);
router.get('/profile', authMiddleware, userController.profile);
router.get('/logout', userController.logout);

//Exportar
module.exports = router;