import { String } from 'aws-sdk/clients/acm'

// import {  } from '@prisma/client'
interface IGraphqlError {
  type: string
  code: number
  message: String
}

export default (
  message = 'Something went wrong',
  type = 'error',
  code = 500,
): IGraphqlError => {
  return { message, type, code }
}
