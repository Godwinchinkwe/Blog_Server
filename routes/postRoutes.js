const {Router} = require('express')

const {createPost, getPost, getCatPost, getPosts, editPost, getUserPosts, deletePost, removeEventListener} = require('../controllers/postControllers')
const authMiddleware = require('../middleware/authMiddleware')

const router = Router()

router.post('/', authMiddleware, createPost)
router.get('/', getPosts)
router.get('/:id', getPost)
router.patch('/:id', editPost)
router.get('/categories/:category', getCatPost)
router.get('/users/:id', getUserPosts)
router.patch('/:id', authMiddleware, editPost)
router.delete('/:id', authMiddleware, deletePost)

module.exports = router