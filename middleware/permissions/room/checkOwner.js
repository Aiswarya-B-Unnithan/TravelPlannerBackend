import Room from '../../../models/hostModels/Room.js';

const checkOwner = async (req) => {
 
  try {
    const room = await Room.findOne({
      _id: req.params.roomId,
      uid: req.user.userId,
    });

    if (room) return true;
    return false;
  } catch (error) {
    console.log(error);
    return 'error';
  }
};

export default checkOwner;
