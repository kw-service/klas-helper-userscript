import path from 'path';

const appDirectory = process.cwd();
const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

interface Paths {
  appDev: string;
  appDist: string;
  appSrc: string;
  appUserscript: string;
  appMain: string;
  appExtMain: string;
}

const paths: Paths = {
  appDev: resolveApp('dev'),
  appDist: resolveApp('dist'),
  appSrc: resolveApp('src'),
  appUserscript: resolveApp('src/klas-helper.user.js'),
  appMain: resolveApp('src/main.js'),
  appExtMain: resolveApp('src/main-ext.js')
};

export default paths;