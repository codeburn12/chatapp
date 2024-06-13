import React, { useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { Box } from "@chakra-ui/react";
import Header from "../components/Header/Header";
import MyChat from "../components/Chats/MyChat";
import ChatBox from "../components/Chats/ChatBox";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false)
  return (
    <div style={{ width: "100%" }}>
      {user && <Header />}

        <div style={{ display: "flex", justifyContent: "space-between",  width:"100%" , padding:"10px" }}>
          {user && <MyChat fetchAgain={fetchAgain} />}
          {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        </div>

    </div>
  );
};

export default ChatPage; 
