import aws from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

// Configure aws with your accessKeyId and your secretAccessKey
// aws.config.update({
//     region: 'us-west-1', // Put your aws region here
//     accessKeyId: process.env.AWSAccessKeyId,
//     secretAccessKey: process.env.AWSSecretKey
// });

const ACL = 'private'

// Now lets export this function so we can call it from somewhere else
export const sign_s3_upload = async ({
  fileName,
  fileType,
}: {
  fileName: string
  fileType: string
}): Promise<ISignedFile> => {
  // console.log(process.env.AWSAccessKeyId,process.env.AWSSecretKey);
  const uniquefolder = 'resumes/' + uuidv4() + fileName.replace(' ', '-')
  const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
  }) // Create a new instance of S3
  let returnData: ISignedFile

  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: process.env.AWS_BUCKET,
    Key: uniquefolder,
    Expires: 500,
    ContentType: fileType,
    ACL,
  }
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  try {
    const signedUrl = await s3.getSignedUrl('putObject', s3Params)
    returnData = {
      success: true,
      data: {
        signedRequest: signedUrl,
        url: `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${uniquefolder}`,
        acl: ACL,
      },
    }
  } catch (err) {
    console.log(err)
    returnData = { success: false, error: err, data: null }
  }

  return returnData
}

interface ISignedFile {
  success: boolean
  data: IsuccessSignedFile | null
  error?: object
}

interface IsuccessSignedFile {
  acl: string
  signedRequest: string
  url: string
}

export const sign_s3_read = async (filePath: string) => {
  const s3 = new aws.S3({
    region: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
  }) // Create a new instance of S3

  const s3Params = {
    Bucket: process.env.AWS_BUCKET,
    Key: filePath.split('.com/')[1] || filePath.substring(1),
    Expires: 500,
  }

  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  try {
    const signedUrl = await s3.getSignedUrl('getObject', s3Params)
    return signedUrl
  } catch (err) {
    console.log(err)
    return null
  }
}
