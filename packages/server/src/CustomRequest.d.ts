import {Request} from 'express'

export interface CustomeRequest extends Request {
  query: { currentTime: string, id: string };
}
