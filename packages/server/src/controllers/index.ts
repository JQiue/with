import path from 'path';
import { readFileSync, writeFile, createReadStream } from 'fs';
import { Response } from 'express';
import { io, songStatus } from '../app';
import { CustomeRequest } from '../CustomRequest';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('1234567890', 4);

interface Songs {
  [key: string]: {
    id: string | undefined;
    name: string | undefined;
    filename: string | undefined;
    path: string | undefined;
    size: number | undefined;
  };
}

const songs = JSON.parse(
  readFileSync(path.resolve(__dirname, '../songs.json')).toString()
) as Songs;

export const syncSong = (req: CustomeRequest, res: Response) => {
  io.emit('updateCurrentTime', songStatus.currentTime);
  return '同步进度成功';
};

export const getSong = (req: CustomeRequest, res: Response) => {
  const { filename, size } = songs[req.query.id];
  const filePath = path.resolve(__dirname, '../songs/' + filename);
  res.set('Accept-Ranges', 'bytes');
  res.set('Content-Type', 'audio/mp3');
  res.set('Content-Length', '' + size);
  res.set('Content-Range', `bytes 0-${size}/${size}`);
  const rs = createReadStream(filePath, {
    highWaterMark: 1024 * 30
  })
  rs.pipe(res);
};

export const getList = (req: CustomeRequest, res: Response) => {
  return { msg: '获取列表成功', list: songs };
};

export const getCurrentTime = (req: CustomeRequest, res: Response) => {
  songStatus.currentTime = req.query.currentTime;
  return '获取歌词进度成功';
};

export const uploadSong = (file: Express.Multer.File | undefined) => {
  const id = nanoid();
  songs[id] = {
    id: id,
    name: file?.originalname,
    filename: file?.filename,
    path: file?.path,
    size: file?.size,
  };
  writeFile(
    path.resolve(__dirname, '../songs.json'),
    JSON.stringify(songs),
    (err) => console.log(err)
  );
  return { msg: '上传成功', file };
};
