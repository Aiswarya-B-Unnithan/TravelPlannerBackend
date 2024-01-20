import checkOwner from './checkOwner.js';

const roomPermissions = {
  update: {
    roles: ['Admin'],
    owner: checkOwner,
  },
  delete: {
    roles: ['Admin',],
    owner: checkOwner,
  },
};

export default roomPermissions;
