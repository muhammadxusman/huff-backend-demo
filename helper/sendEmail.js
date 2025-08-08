const { SendMailClient } = require("zeptomail");
const fs = require("fs");
const path = require("path");
const ejs = require('ejs');


const sendMail = async ({ emails, subject, htmlContent }) => {
  try {
    const url = process.env.MAIL_URL; // ZeptoMail API URL
    const token = process.env.MAIL_TOKEN; // ZeptoMail API Token

    const mailClient = new SendMailClient({ url, token });

    console.log("token--Email---->",token);


    // Prepare email data   
    const recipients = emails.map((email) => ({
      email_address: {
        address: email,
      },
    }));

    mailClient
      .sendMail({
        from: {
          address: process.env.MAIL_FROM,
          name: process.env.MAIL_SENDER_NAME,
        },
        to: recipients,
        subject: subject,
        htmlbody: htmlContent,
      })
      .then((resp) => {
        console.log({
          message: "Email sent successfully",
          response: resp,
          detailedMessage: resp.message,
          data: resp.data ? resp.data[0] : undefined,
        });
      })
      .catch((error) => {
        console.error({
          message: "Error sending email",
          error: error,
          errorMessage: error.message,
          code: error.code,
          additional_info: error.additional_info,
        });
      });
  } catch (error) {
    console.error("Error in sendMail function:", error);
  }
};

const sendTemplateDataMail = async ({ emails, subject, templateName,data }) => {
  try {


    const templatePath = path.join(__dirname, "../email_templates", `${templateName}.ejs`);
    let emailTemplate = fs.readFileSync(templatePath, "utf-8");
    // Replace placeholders with actual values
    // Object.keys(data).forEach((key) => {
    //   emailTemplate = emailTemplate.replace(`{{${key}}}`, data[key]);
    // });
    const emailHTML = ejs.render(emailTemplate, data);

    const url = process.env.MAIL_URL; // ZeptoMail API URL
    const token = process.env.MAIL_TOKEN; // ZeptoMail API Token
     console.log("token--Email---->",token);

    const mailClient = new SendMailClient({ url, token });

    // Prepare email data
    const recipients = emails.map((email) => ({
      email_address: {
        address: email,
      },
    }));


    mailClient
      .sendMail({
        from: {
          address: process.env.MAIL_FROM,
          name: process.env.MAIL_SENDER_NAME,
        },
        to: recipients,
        subject: subject,
        htmlbody: emailHTML,
      })
      .then((resp) => {
        console.log({
          message: "Email sent successfully",
          response: resp,
          detailedMessage: resp.message,
          data: resp.data ? resp.data[0] : undefined,
        });
      })
      .catch((error) => {
        console.error({
          message: "Error sending email",
          error: error,
          errorMessage: error.message,
          code: error.code,
          additional_info: error.additional_info,
        });
      });
  } catch (error) {
    console.error("Error in sendMail function:", error);
  }
};

module.exports = { sendMail,sendTemplateDataMail };
