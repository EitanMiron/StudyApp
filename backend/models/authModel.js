const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema
//need to define 
const authSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true, 
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['student', 'tutor'],
            required: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        profilePic: {
            type: String,
            default:'https://example.com/default-avatar.png',
        },
        // createdAt: {
        //     type: Date,
        //     default: Date.now
        // },
    },

    {
        timestamps: true,
    }



);

//Hash password before saving to the database
authSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error){
        next(error);
    }
    
})

//method to comapre password for login

authSchema.methods.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
}

//create user authorization model
module.exports = mongoose.model('UserAuth', authSchema);

