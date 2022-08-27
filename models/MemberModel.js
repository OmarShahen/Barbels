const mongoose = require('mongoose')
const MemberSchema = new mongoose.Schema({

    clubId: { type: mongoose.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true, },
    countryCode: { type: String, required: true },
    canAuthenticate: { type: Boolean, required: true },
    QRCodeURL: { type: String },
    isBlocked: { type: Boolean, default: false }

}, { timestamps: true })

MemberSchema.index({ name: 'text', email: 'text', phone: 'text' })

module.exports = mongoose.model('Member', MemberSchema)