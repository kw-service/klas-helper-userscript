import path from 'path';

const appDirectory = process.cwd();
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

interface Paths {
  appDist: string;
  appSrc: string;
  appHeaders: string;
  appUserscript: string;
  appMain: string;
}

const paths: Paths = {
  appDist: resolveApp('dist'),
  appSrc: resolveApp('src'),
  appHeaders: resolveApp('config/headers.json'),
  appUserscript: resolveApp('src/klas-helper.user.js'),
  appMain: resolveApp('src/main.js')
};

export default paths;