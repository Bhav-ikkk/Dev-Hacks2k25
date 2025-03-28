import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUsersForSidebar, getMessages, sendMessage } from '../controllers/message.controller.js'; 
import router from './auth.route.js';

const route = express.Router();

router.get('/users', protectRoute, getUsersForSidebar);
router.get('/:id', protectRoute, getMessages);

router.post('/send/:id', protectRoute, sendMessage);

export default router;