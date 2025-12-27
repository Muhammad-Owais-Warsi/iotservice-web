const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Storage configuration
let storage;

if (isProduction) {
    // Vercel/Production: Use Memory Storage to avoid Read-Only FS errors
    storage = multer.memoryStorage();
} else {
    // Local Development: Use Disk Storage
    const uploadDir = path.join(__dirname, '../uploads/tickets');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
}

// File filter (images only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
