import aws from 'aws-sdk'
import uuid from 'uuid'

// Configure aws with your accessKeyId and your secretAccessKey
// aws.config.update({
//     region: 'us-west-1', // Put your aws region here
//     accessKeyId: process.env.AWSAccessKeyId,
//     secretAccessKey: process.env.AWSSecretKey
// });

const S3_BUCKET = process.env.Bucket ?? ''
const ACL = 'private'

// Now lets export this function so we can call it from somewhere else
export const sign_s3_upload = async ({
  fileName,
  fileType,
}: {
  fileName: string
  fileType: string
}) => {
  // console.log(process.env.AWSAccessKeyId,process.env.AWSSecretKey);
  const uniquefolder = 'resumes/' + uuid.v4() + fileName.replace(' ', '-')
  const s3 = new aws.S3({
    region: 'us-west-1',
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
  }) // Create a new instance of S3
  let returnData = {}

  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: uniquefolder,
    Expires: 500,
    ContentType: fileType,
    ACL,
    signature: 'v4',
  }
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  try {
    const signedUrl = await s3.getSignedUrl('putObject', s3Params)
    returnData = {
      success: true,
      data: {
        signedRequest: signedUrl,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${uniquefolder}`,
        acl: ACL,
      },
    }
  } catch (err) {
    console.log(err)
    returnData = { success: false, error: err }
  }

  return returnData
}

export const sign_s3_read = async (filePath: string) => {
  const s3 = new aws.S3({
    region: 'us-west-1',
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
  }) // Create a new instance of S3

  const s3Params = {
    Bucket: S3_BUCKET,
    Key: filePath.split('.com/')[1] || filePath.substring(1),
    Expires: 500,
    signature: 'v4',
  }
  return ''
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  try {
    const signedUrl = await s3.getSignedUrl('getObject', s3Params)
    return signedUrl
  } catch (err) {
    return null
  }
}
