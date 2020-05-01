const nodemailer = require('nodemailer')
let aws = require('aws-sdk')

// configure AWS SDK
aws.config({
  accessKeyId: process.env.AWS_SES_AccessKey,
  secretAccessKey: process.env.AWS_SES_SecretKey,
  region: 'us-east-1',
})

// create Nodemailer SES transport
export const transport = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01',
  }),
  sendingRate: 14,
})

// send some mail
// transport.sendMail(
//   {
//     from: 'sender@exactstaff.com',
//     to: 'sender@exactstaff.com',
//     subject: 'Message',
//     text: 'I hope this message gets sent!',
//     ses: {
//       // optional extra arguments for SendRawEmail
//       Tags: [
//         {
//           Name: 'tag name',
//           Value: 'tag value',
//         },
//       ],
//     },
//   },
//   (err, info) => {
//     console.log(info.envelope)
//     console.log(info.messageId)
//   },
// )

export const makeANiceEmail = (text: string) => `
    <div className="email" style="
        border: 1px solid black;
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px;
    ">
        <h2>Hello There!</h2>
        <p>${text}</p>
        <p>MyExactJobs Team 😎,</p>
    </div>
`

//////////////////////////////////////////////////

// const transport = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: process.env.MAIL_POST,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// })
