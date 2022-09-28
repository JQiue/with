import express, { Response } from 'express';
import { CustomeRequest } from '../CustomRequest';
import {
  getCurrentTime,
  getSong,
  syncSong,
  uploadSong,
  getList,
} from '../controllers';
import path from 'path'
import multer from 'multer'

const upload = multer({
  dest: path.resolve(__dirname, '../songs'),
  fileFilter: (req, file, callback)=>{
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    callback(null, true)
  }
})

const router = express.Router();

router.get('/song', (req: CustomeRequest, res: Response) => {
  getSong(req, res)
});

router.post('/current-time', (req: CustomeRequest, res) => {
  res.send(getCurrentTime(req, res));
});

router.get('/list', (req: CustomeRequest, res: Response) => {
  res.send(getList(req, res));
});

router.get('/sync', (req: CustomeRequest, res) => {
  res.send(syncSong(req, res));
});

router.post('/upload', upload.single('file'), (req: CustomeRequest, res)=> {
  res.send(uploadSong(req.file));
})

export default router;
