import Event from "../models/eventModel.js";
import Users from "../models/userModel.js";

export const createEvent = async (req, res, next) => {
 

  const { userId, title, description, date, location, participants } = req.body;
const user = await Users.findById(userId);

  const event = await Event.create({
    title,
    description,
    date,
    location,
    // participants,
    organizer: userId,
  });

  res.status(200).json({
    success: true,
    message: "event created successfully",
    data: event,
    userName: `${user.firstName} ${user.lastName}`,
  });
};

export const getEvents = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;
   
    const user = await Users.findById(userId);
   
    const friends = user?.friends?.toString().split(",") ?? [];
    friends.push(userId);

    const searchPostQuery = {
      $or: [
        {
          description: { $regex: search, $options: "i" },
        },
      ],
    };

    const events = await Event.find(search ? searchPostQuery : {})
      .populate({
        path: "organizer",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

 

    const friendsEvents = events?.filter((event) => {
      return friends.includes(event?.organizer?._id.toString());
    });
    

    const otherEvents = events?.filter(
      (event) => !friends.includes(event?.organizer?._id.toString())
    );


    let eventRes = null;

    if (friendsEvents?.length > 0) {
      eventRes = search ? friendsEvents : [...friendsEvents, ...otherEvents];
    } else {
      eventRes = events;
    }
    
    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: eventRes,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


export const deleteEvent = async (req, res, next) => {

  try {
    const { id } = req.params;

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};