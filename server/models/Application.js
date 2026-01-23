const mongoose = require('mongoose');

const stageSchema = mongoose.Schema({
  name: { type: String, required: true }, // e.g.,'OA','Technical Round 1'
  date: { type: Date },
  status: { 
    type: String, 
    enum: ['pending', 'cleared', 'rejected', 'upcoming'],
    default: 'upcoming'
  },
  notes: { type: String }
});

const applicationSchema = mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['applied', 'in-progress', 'offer', 'rejected'],
    default: 'applied'
  },
  appliedDate: { type: Date, default: Date.now },
  referralUsed: { type: Boolean, default: false },
  oaLink: { type: String },
  notes: { type: String },
  stages: [stageSchema],
  nextDeadline: { type: Date }, 
}, { timestamps: true });

applicationSchema.index({ companyName: 'text', role: 'text' });
applicationSchema.index({ student: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
