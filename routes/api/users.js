const express= require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator/check');
const config = require('config')
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcyrpt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Valid Email is required').isEmail(),
    check('password', 'Password have to more than 4 Characters').isLength({
        min: 5
    })
],
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() })
    }

    const {name, email, password} = req.body
    
    try{
        let user = await User.findOne({email})

        if(user) {
            return res.status(400).json({ msg: 'User already exists'})
        }
        const avatar = gravatar.url(email,{
            s:'200',
            r: 'pg',
            d: 'mm'
        });
        
        user = new User({
            name,
            email,
            password,
            avatar
        });

        const salt = await bcyrpt.genSalt(10);

        user.password = await bcyrpt.hash(password, salt);

        await user.save()


        const payload = {
            user: {
                id: user.id
            } 
        }
        

        jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 36000}, (err, token) => {
            if (err) throw err;
            res.json({token});
        }) 
    } catch (err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }

    });

module.exports = router;