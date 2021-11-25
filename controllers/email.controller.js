const nodemailer = require('nodemailer');
// email sender function
exports.sendEmail = function(req, res){
// Definig the transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'kiwilabsofficial@gmail.com',
            pass: 'Ezekiel29.'
        }
    });
// Definitio email
const mailOptions = {
    from: 'Remitta',
    to: 'adeyemitomiwa7@@gmail.com',
    subject: 'welcome',
    text: 'welcome asshole'
};
//  email
transporter.sendMail(mailOptions, function(error, info){
    if (error){
        console.log(error);
        res.send(500, err.message);
    } else {
        console.log("Email sent");
        res.status(200).jsonp(req.body);
    }
});
};