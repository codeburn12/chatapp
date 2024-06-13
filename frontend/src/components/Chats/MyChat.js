import React, { useState, useEffect } from "react";
import { ChatState } from "../../context/ChatProvider";
import { AddIcon } from "@chakra-ui/icons";
import {
  useToast,
  Box,
  Button,
  Stack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import ChatSkeleton from "../Header/ChatSkeleton";
import CreateGroup from "./CreateGroup";
import { getSender } from "../../config/ChatLogics";

const MyChat = ({ fetchAgain }) => {
  const { user, chat, setChat, selectChat, setSelectChat } = ChatState();

  const [loggedUser, setLoggedUser] = useState();

  const toast = useToast();
  const fetchChatHandler = async () => {
    if (!chat) { 
      toast({
        title: "Chat not found",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-left",  
      });
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.data.token}` },
      };
      const { data } = await axios.get("/api/chat", config);
      setChat(data);
    } catch (error) {
      toast({
        title: "User not found",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChatHandler();
  }, [fetchAgain]);
  return (
    <Box
      d={{ base: selectChat ? "none" : "flex", md: "flex" }}
      flexDir="column"  
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      // h={{base: "100%"}}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <CreateGroup>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </CreateGroup>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100vh"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chat ? (
          <Stack overflowY="scroll">
            {chat.map((chat) => (
              <Box
                onClick={() => setSelectChat(chat)}
                cursor="pointer"
                bg={selectChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users) : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatSkeleton />
        )}
      </Box>
    </Box>
  );
};

export default MyChat;
