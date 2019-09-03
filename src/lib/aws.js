const aws = require('aws-sdk'); 

// Configure aws with your accessKeyId and your secretAccessKey
// aws.config.update({
//     region: 'us-west-1', // Put your aws region here
//     accessKeyId: process.env.AWSAccessKeyId,
//     secretAccessKey: process.env.AWSSecretKey
// });

const S3_BUCKET = process.env.bucket;
const ACL = 'public-read';

// Now lets export this function so we can call it from somewhere else 
exports.sign_s3 = async ({fileName, fileType}) => {
  console.log(fileType);
  console.log(fileName);
  // console.log(process.env.AWSAccessKeyId,process.env.AWSSecretKey);
    const s3 = new aws.S3({
      region: 'us-west-1',
      accessKeyId: process.env.AWSAccessKeyId,
      secretAccessKey: process.env.AWSSecretKey,
      Bucket: S3_BUCKET,
      signature: 'v4'
    });  // Create a new instance of S3
    let returnData = {};

  // Set up the payload of what we are sending to the S3 api
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 500,
      ContentType: fileType,
      ACL
    };
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  try {
    const signedUrl = await s3.getSignedUrl('putObject', s3Params);
    returnData = {success: true, data: {
        signedRequest: signedUrl,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
        acl: ACL
      }};
  }
  catch(err) {
    console.log(err);
    returnData = {success: false, error: err};
  }
 
  return returnData;
  }