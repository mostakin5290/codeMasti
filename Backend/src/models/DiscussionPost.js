const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[^\w\-]+/g, '')       
        .replace(/\-\-+/g, '-')         
        .replace(/^-+/, '')             
        .replace(/-+$/, '');            
};

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const DiscussionPostSchema = new Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    code: { 
        type: String 
    },
    language: { 
        type: String 
    },
    problem: { 
        type: Schema.Types.ObjectId, 
        ref: 'Problem', 
        required: true 
    },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    likes: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    slug: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    comments: [CommentSchema] 
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
});

DiscussionPostSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});

DiscussionPostSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

DiscussionPostSchema.pre('validate', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title) + '-' + Date.now();
    }
    next();
});

DiscussionPostSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'author',
        select: 'username avatar'
    }).populate({
        path: 'comments.author',
        select: 'username avatar'
    });
    next();
});

module.exports = mongoose.model('DiscussionPost', DiscussionPostSchema);