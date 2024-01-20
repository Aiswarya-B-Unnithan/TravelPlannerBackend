import Messages from "../models/messageModel.js";

export const createMessage = async (req, res) => {

  const { chatId, from, to, message } = req.body;
  const { type, content } = message;
  let data;

  if (type === "text") {
    // For text messages
    data = await Messages.create({
      message: { type, content: { text: content } },
      users: [from, to],
      sender: from,
      chatId,
    });
  } else {
    // Handle invalid message types
    return res.status(400).json({ error: "Invalid message type" });
  }

  if (data) {
    res.json(data);
  } else {
    res.json({
      msg: "Failed to add message to the database",
      data: null,
    });
  }
};
export const getMessages = async (req, res) => {
  const chatId  = req.params.chatId;
  
  try {
    const messages = await Messages.find( {chatId} );
    const projectedMessages = messages?.map((msg) => {
      const messageType = msg.message.type;
      const messageContent = getMessageContent(msg.message);
      const isRead = msg.isRead;
      return {
        // fromSelf: msg.sender.toString() === from,
        chatId,
        type: messageType,
        content: messageContent,
        createdAt: msg.createdAt,
        isRead,
      };
    });

    res.json(projectedMessages);
  } catch (error) {
    console.log(error);
  }
};

const getMessageContent = (message) => {
  switch (message.type) {
    case "text":
      return { text: message?.content?.text };
    case "image":
      return { imageUrl: message?.content?.imageUrl };
    case "file":
      return {
        fileUrl: message?.content?.fileUrl,
      };
    case "voice":
      return {
        voiceUrl: message?.content?.voiceUrl,
      };
    case "video":
      return { videoUrl: message?.content?.videoUrl };
    default:
      return null;
  }
};
