import pkg from '../../package.json';

type PackageJon = {
  name: string;
  description: string;
  version: string;
};

export const loadPackageJson = (): PackageJon => {
  return pkg;
};
