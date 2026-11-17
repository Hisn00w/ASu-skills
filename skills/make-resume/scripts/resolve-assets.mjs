// 定位简历模板资源目录，兼容两种布局：
// - 仓库布局：skills/make-resume/scripts/ -> <仓库>/assets/
// - 安装布局：skills/make-resume/scripts/ -> <安装目录>/assets/asu/
//    （安装器把共享 assets/ 复制到 skills 目录的上一级，命名为 assets/asu/）
//
// 脚本随 skill 一起安装，因此只能从自身位置向上查找，不能假设仓库根目录存在。
// 判定依据是共享外框 assets/frame/base.css，两种布局下都存在。
import fs from 'node:fs';
import path from 'node:path';

const LAYOUT_CANDIDATES = ['assets', path.join('assets', 'asu')];
const MAX_DEPTH = 5;

export function resolveAssetsRoot(fromDir) {
  let dir = path.resolve(fromDir);
  for (let depth = 0; depth <= MAX_DEPTH; depth += 1) {
    for (const relative of LAYOUT_CANDIDATES) {
      const candidate = path.join(dir, relative);
      if (fs.existsSync(path.join(candidate, 'frame', 'base.css'))) {
        return candidate;
      }
    }
    dir = path.dirname(dir);
  }
  throw new Error(
    '未找到模板资源目录：缺少 assets/frame/base.css（仓库布局）或 assets/asu/frame/base.css（安装布局）',
  );
}
