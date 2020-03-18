const express= require('express');
const router = express.Router();
const {check, validationResult} = require ('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');


//ADD A POST
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req,res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        
        const newPost = new Post ({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

//GET ALL POST USERS
router.get('/', auth, async(req, res) => {
    try {
        const posts = await Post.find().sort({date:-1});
        res.json(posts)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//GET POST BY USERS ID
router.get('/:id', auth, async ( res, req) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({msg: 'Post not found'});
        }

        res.json(post)

    } catch (err) {
        console.error(err.message);

        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Post not found'})
        };

        res.status(500).send('Server Error')
    }
})
});

//DELETE POST BY ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
             return res.status(404).json({msg: 'Post not found'})
        }   

        //Check user
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'});
        }

        await post.remove();

        res.json({msg: 'Post removed'})
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Post not found'})
        }

        res.status(500).send('Server Error')
    }
});

//LIKES AND UNLIKES POST
router.put('/like/:id', auth, async(req,res) =>{
    try {
        const post = await Post.findById(req.params.id);

        //CHECK IF YOU USER HAS BEEN ALREADY LIKED
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({msg: 'Post alread liked'})
        }
        
        post.likes.unshift({user: req.user.id});

        await post.save()

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//DISLIKE POST
router.put('/unlike/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({msg: 'Post has not yet been liked'})
        };

        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

//ADD COMMENT
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
    };
    
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }

        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});

//DELETE COMMENTS
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //PULL OUT THE COMMENT 
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        //CHECK COMMENT IS EXIST
        if(!comment) {
            return res.status(404).json({msg: 'Comment does not exist'})
        };

        //CHECK USER
        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'})
        };

        //GET THE COMMENT INDEX
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save()

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})
module.exports = router;