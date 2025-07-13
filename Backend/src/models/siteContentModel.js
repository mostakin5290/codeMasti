const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const SiteContent = mongoose.model('SiteContent', siteContentSchema);
module.exports = SiteContent;