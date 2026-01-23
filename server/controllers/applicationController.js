const Application = require('../models/Application');
const asyncHandler = require('../utils/asynchandler');

const getApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, sortBy } = req.query;
  
  // Build query
  const query = { student: req.user.id };
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (status) {
    query.status = status;
  }
  
  // Build sort
  let sortOptions = { appliedDate: -1 }; 
  if (sortBy === 'oldest') sortOptions = { appliedDate: 1 };
  if (sortBy === 'company') sortOptions = { companyName: 1 };
  
  // Execute query with pagination
  const applications = await Application.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
    
  
  const count = await Application.countDocuments(query);
  
  res.json({
    applications,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalApplications: count
  });
});

const createApplication = asyncHandler(async (req, res) => {
  const { companyName, role, oaLink, appliedDate } = req.body;

  const application = new Application({
    student: req.user.id,
    companyName,
    role,
    oaLink,
    appliedDate,
  });

  const createdApplication = await application.save();
  res.status(201).json(createdApplication);
});

const updateApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const application = await Application.findById(id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  // Check if user owns this application
  if (application.student.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  application.companyName = req.body.companyName || application.companyName;
  application.role = req.body.role || application.role;
  application.status = req.body.status || application.status;
  application.oaLink = req.body.oaLink !== undefined ? req.body.oaLink : application.oaLink;
  application.referralUsed = req.body.referralUsed !== undefined ? req.body.referralUsed : application.referralUsed;
  application.notes = req.body.notes !== undefined ? req.body.notes : application.notes;
  application.nextDeadline = req.body.nextDeadline || application.nextDeadline;

  const updatedApplication = await application.save();
  res.json(updatedApplication);
});

const deleteApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const application = await Application.findById(id);

  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  // Check if user owns this application
  if (application.student.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await Application.findByIdAndDelete(id);
  res.json({ message: 'Application deleted successfully' });
});

const updateApplicationStage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stageName, status, date } = req.body;

  const application = await Application.findById(id);

  if (application) {
    const newStage = {
      name: stageName,
      status,
      date: date || Date.now()
    };
    
    application.stages.push(newStage);
    
   
    if (status === 'rejected') application.status = 'rejected';
    if (stageName.toLowerCase() === 'offer') application.status = 'offer';

    await application.save();
    res.json(application);
  } else {
    res.status(404).json({ message: 'Application not found' });
  }
});

module.exports = { getApplications, createApplication, updateApplication, deleteApplication, updateApplicationStage };
