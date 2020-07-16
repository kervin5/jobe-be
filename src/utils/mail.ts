import appText from '../../lang/appText'
import nodemailer from 'nodemailer'
import aws from 'aws-sdk'

const currentRegion = process.env.AWS_CUSTOM_REGION

// configure AWS SDK
aws.config.update({
  region: currentRegion, // Put your aws region here
  accessKeyId: process.env.AWS_SES_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SES_SECRET_KEY,
})

// create Nodemailer SES transport
export const transport = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01',
    accessKeyId: process.env.AWS_SES_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SES_SECRET_KEY,
    region: currentRegion,
    endpoint: `email.${currentRegion}.amazonaws.com`,
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
        <h2>${appText.emails.salutation}!</h2>
        <p>${text}</p>
        <p>${appText.emails.signature} 😎,</p>
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
