import fs from 'fs'
import path from 'path'


// 创建 songs.json

function hasSongsJSON():boolean {
  return fs.existsSync(path.resolve(__dirname, '../songs.json'));
}


export default function init() {
  if (hasSongsJSON()) {
    console.log('歌曲清单文件存在');
  } else {
    fs.writeFileSync(path.resolve(__dirname, '../songs.json'), '{}');
    console.log('不存在歌曲清单文件，已创建->', path.resolve(__dirname, '../songs.json'));
  }
}
