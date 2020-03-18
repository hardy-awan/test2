const express= require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator')

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');


//AUTH PROFILE
router.get('/user-profile', auth, async (req,res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);

        if(!profile) {
            return res.status(400).json({msg : 'There is no profile for this user'})
        }

        res.json(profile)
    } catch (err){
        console.log(err.message)
        res.status(500).send('Server Error')
    }
});

router.post('/user-profile', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
] ],
 async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skills => skills.trim());
    }
    
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkendin = linkendin;

    //UPDATE PROFILE
    try {
        let profile = await Profile.findOne({user: req.user.id});

        if (profile) {
        profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, { new: true});

        return res.json(profile);
        }

        //CREATE NEW PROFILE
        profile = new Profile(profileFields);
        
        await profile.save();
        res.json(profile);
        
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error')
    }
} );


//PUBLIC PROFILE
router.get('/users-profiles', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

router.get('/user-profile/:user_id', async(req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name','avatar']);
        
        if(!profile) 
            return res.status(400).json({msg: 'Profile not Found'});

        res.json(profile);
    } catch (err) {
        console.error(err.message);

        if(!err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'Profile not Found'})
        };
        res.status(500).send('Server Error');
    }
});

//DELETE PROFILE AND USER

router.delete('/', auth, async (req, res) => {
    try {
        //REMOVE USER POST
        await Post.deleteMany({user: req.user.id})
        //REMOVE PROFILE
        await Profile.findOneAndRemove({user: req.user.id});
        // REMOVE USER
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'User deleted'})
        
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});

//ADD EXPERIANCE AND EDUCATION

//ADD AN EXPERIANCE

router.put('/user-profile/experience', [auth, [
    check('title', 'Title is Required').not().isEmpty(),
    check('company', 'Company is Required').not().isEmpty(),
    check('from', 'From date is Required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.experience.unshift(newExp);
        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error');
    }
});

//DELETE AN EXPERIANCE

router.delete('/user-profile/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//ADD EDUCATION

router.put('/user-profile/education', [auth,[
    check('school', 'School is Required').not().isEmpty(),
    check('location', 'Location is Required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is Required').not().isEmpty(),
    check('from', 'From date is required')
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }
    const {
        school,
        degree,
        location,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        location,
        fieldofstudy,
        from,
        to,
        current,
        description
    };

    try {
        const profile = await Profile.findOne({user: req.user.id});

        profile.education.unshift(newEdu);

        await profile.save()

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//DELETE EDUCATION

router.delete('/user-profile/education/:edu_id',auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1);

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

//GET GITHUB RESPO

router.get('/user-profile/github/:username', async (req, res) =>{
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('gitClientid')}&client_secret=${config.get('gitClientSecret')}`,
            method: 'GET',
            headers:{'user-agent': 'node.js'}
        }

        request(options,(error, response, body) => {
            if(error) console.error(error);

            if(response.statusCode !== 200) {
                return res.status(404).json({msg: 'No Github profile found'})
            }

            res.json(JSON.parse(body));
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});
module.exports = router;
