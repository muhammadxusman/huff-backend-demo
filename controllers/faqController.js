const {faq} = require('../models/index');

exports.createFaq = async (req, res) => {
    try {
        const { question, answer, status } = req.body;

        // Validate required fields
        if (!question || !answer) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check for existing FAQ with the same question and answer
        const existingFaq = await faq.findOne({ where: { question, answer } });

        if (existingFaq) {
            return res.status(409).json({ message: 'FAQ with the same question and answer already exists' });
        }

        // Create the new FAQ
        const newFaq = await faq.create({ question, answer, status });

        return res.status(201).json(newFaq);
    } catch (error) {
        console.error('Error creating FAQ:', error);
        return res.status(500).json({ error: 'Internal server error' });    
    }
}


exports.getAllFaqs = async (req, res) => {
  try {
    const allFaqs = await faq.findAll({
      order: [['createdAt', 'DESC']], // Optional: latest first
    });

    return res.status(200).json(allFaqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getAllFaqs_app = async (req, res) => {
  try {
    const allFaqs = await faq.findAll({
        where : { status: 'active' }, // Only fetch active FAQs
        attributes: { exclude: ['createdAt', 'updatedAt', 'status'] } ,
      order: [['createdAt', 'DESC']], // Optional: latest first
    });

    return res.status(200).json(allFaqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Update FAQ status
exports.updateFaqStatus = async (req, res) => {
  try {
    const { id } = req.body;
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Find FAQ by ID
    const existingFaq = await faq.findByPk(id);

    if (!existingFaq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // Update the status
    existingFaq.status = status;
    await existingFaq.save();

    return res.status(200).json({ message: 'FAQ status updated successfully', faq: existingFaq });
  } catch (error) {
    console.error('Error updating FAQ status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

