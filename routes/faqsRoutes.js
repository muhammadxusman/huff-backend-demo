const express = require('express');
const router = express.Router();
const {createFaq,getAllFaqs,getAllFaqs_app,updateFaqStatus} = require('../controllers/faqController');


router.post('/add-faqs', createFaq);
router.get('/show-all-faqs', getAllFaqs);
router.get('/show-all-faqs-app', getAllFaqs_app);
router.patch('/update-faq-status', updateFaqStatus);


module.exports = router;