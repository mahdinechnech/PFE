import express from 'express'
import ForumPost from '../models/ForumPost.js'
import { auth } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all forum posts
router.get('/', async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('author', 'username avatar role')
      .populate('comments.author', 'username avatar role')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des posts' });
  }
});

// Create a forum post
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Le contenu est requis' });
    }

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newPost = new ForumPost({
      author: req.user.id,
      content,
      images
    });

    const savedPost = await newPost.save();
    const populatedPost = await ForumPost.findById(savedPost._id).populate('author', 'username avatar role');
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création du post' });
  }
});

// Toggle like on a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });

    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du like' });
  }
});

// Add a comment to a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Le commentaire est vide' });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });

    const newComment = {
      author: req.user.id,
      content
    };

    post.comments.push(newComment);
    await post.save();
    
    const updatedPost = await ForumPost.findById(post._id).populate('comments.author', 'username avatar role');
    res.json(updatedPost.comments);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

export default router;
