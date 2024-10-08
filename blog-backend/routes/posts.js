const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    // Create a new post
    const newPost = new Post({
      title,
      content,
      user: req.user.id, // Include the user ID
      likes: []
    });

    // Save the post to the database
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username').populate('likes', 'username');
    // Ensure likes field is an array
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      likes: post.likes || [] // Ensure likes is always an array
    }));
    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});


// Update a post
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Find the post by ID
    const post = await Post.findById(req.params.id);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is authorized to update the post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update the post
    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a post
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the post by ID
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is authorized to delete the post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err); // Log error details
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Route to like a post
/*
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id; // Get user ID from auth middleware
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(userId);
    await post.save();
    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error });
  }
});*/

// Route to get the number of likes
router.get('/:id/likes', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('likes');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.likes != undefined) {
      const post_instance = await Post.findById(req.params.id)
      post_instance.likes.push([]);
      await post_instance.save();
    }
    res.status(200).json({ likes: post.likes != undefined ? post.likes.length : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching likes', error });
  }
});


// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id; // Get user ID from auth middleware
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(userId);
    await post.save();
    res.status(200).json({ message: 'Post liked successfully', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error });
  }
});

// Unlike a post
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id; // Get user ID from auth middleware
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      return res.status(400).json({ message: 'Post not yet liked' });
    }

    post.likes.splice(likeIndex, 1);
    await post.save();
    res.status(200).json({ message: 'Post unliked successfully', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking post', error });
  }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user.id,
      content: content
    };

    post.comments.push(comment);
    await post.save();
    res.status(201).json({ message: 'Comment added successfully', comments: post.comments });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error });
  }
});



// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.user', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.status(200).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

module.exports = router;
