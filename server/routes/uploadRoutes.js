import express from 'express'
import multer from 'multer'
import { uploadConversation } from '../controllers/uploadController.js'

const router = express.Router()

// Use memory storage — we parse the file buffer directly, no disk writes
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
            cb(null, true)
        } else {
            cb(new Error('Only JSON files are allowed.'), false)
        }
    },
})

router.post('/parse', upload.single('file'), uploadConversation)

export default router
