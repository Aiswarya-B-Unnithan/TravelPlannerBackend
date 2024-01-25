import Room from "../../models/hostModels/Room.js";
import tryCatch from "./utils/tryCatch.js";

export const createRoom = tryCatch(async (req, res) => {
   const { userId: uid, name: uName, photoURL: uPhoto } = req.user;
  // Get the latest room to determine the next rId
  const latestRoom = await Room.findOne().sort({ rId: -1 });
  let nextRId = 1;

  if (latestRoom && latestRoom.rId) {
    // Extract the number from the current rId and increment by 1
    nextRId = parseInt(latestRoom.rId.slice(1)) + 1;
  }

  // Format the nextRId with leading zeros
  const formattedRId = `R${nextRId.toString().padStart(3, "0")}`;

  const newRoom = new Room({
    ...req.body,
    uid,
    uName,
    uPhoto,
    rId: formattedRId,
  });
  await newRoom.save();

  res.status(201).json({ success: true, result: newRoom });
});

export const getRooms = tryCatch(async (req, res) => {
  const rooms = await Room.find({ isBlock: false, isDelete: false }).sort({
    _id: -1,
  });
  res.status(200).json({ success: true, result: rooms });
});

export const deleteRoom = tryCatch(async (req, res) => {
  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.roomId,
    { isDelete: true },
    { new: true }
  );
  const _id = updatedRoom._id;
  res.status(200).json({ success: true, result: { _id } });
});

export const updateRoom = tryCatch(async (req, res) => {
  const updatedRoom = await Room.findByIdAndUpdate(
    req.params.roomId,
    req.body,
    { new: true }
  );
  res.status(200).json({ success: true, result: updatedRoom });
});

export const addComment = tryCatch(async (req, res) => {
  try {
    const { roomId } = req.params;

    const { text, userName } = req.body;
    // Find the room document by its ID
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Add the new comment to the room's comments array
    room.comments.push({
      text,
      userName,
    });

    // Save the updated room document
    const updatedRoom = await room.save();

    res.status(200).json({
      success: true,
      data: updatedRoom,
    });
  } catch (error) {
    console.log(error);
  }
});
export const getRoomById = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ room });
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const updateRating = async (req, res) => {
  try {
    const { roomId, newRating } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Push the new rating to the ratings array
    room?.ratings?.push(newRating);

    // Calculate the averageRating
    const totalRating = room?.ratings?.reduce((acc, rating) => acc + rating, 0);
    room.averageRating = totalRating / room.ratings.length;

    // Save the updated room
    await room.save();

    res.json({ message: "Rating updated successfully", room });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const blockRoomByAdmin = async (req, res) => {
  try {
    const { blockingRoomId } = req.params;

    // Find the room by ID
    const room = await Room.findById(blockingRoomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Toggle the isBlock field
    room.isBlock = !room.isBlock;

    // Save the updated room
    const updatedRoom = await room.save();

    // Respond with the updated room
    res.status(200).json({ success: true, result: updatedRoom });
  } catch (error) {
    console.error("Error blocking/unblocking room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
