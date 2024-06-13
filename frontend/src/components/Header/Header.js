import {
  Box,
  Tooltip,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import React, { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import { ChevronDownIcon, BellIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatSkeleton from "./ChatSkeleton";
import Profile from "./Profile";
import UserListItem from "./UserListItem";
import { getSender } from "../../config/ChatLogics";
import NotificationBadge from 'react-notification-badge'
import { Effect } from "react-notification-badge";

const Header = () => {
  const [search, setSearch] = useState(); // input search
  const [searchUser, setSearchUser] = useState([]); // All user display on the basis of keyword
  const [loadingUser, setLoadingUser] = useState(false); // skeleton for user
  const [loadingChat, setLoadingChat] = useState(false); // skeleton for chat

  const { user, chat, setChat, setSelectChat, notification, setNotification } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  // Handlers

  const logOutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    // User start searching without typing
    if (!search) {
      toast({
        title: "Please enter user name",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoadingUser(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.data.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoadingUser(false);
      setSearchUser(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to search result(handle)",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const accessChat = async (userId) => {

    try {
      setLoadingChat(true);
      const config = {
        headers: { Authorization: `Bearer ${user.data.token}` },
        "Content-type": "application/json",
      };

      const { data } = await axios.post(
        `/api/chat`,
        { userId },
        config
      );
      if (!chat.find((c) => c._id === data._id)) setChat([data, ...chat]);
      
      setSelectChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to search result(AccessChat)",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  
  return (
    <>
      {/* Upper header all fuction */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          Howdy
        </Text>

        <Menu>
          <MenuButton p={1}>
            <NotificationBadge
              count={notification.length}
              effect={Effect.SCALE}
            />
            <BellIcon fontSize="2xl" m={1} />
          </MenuButton>
          <MenuList pl={2}>
            {!notification.length && "No New Messages"}
            {notification.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => {
                  setSelectChat(notif.chat);
                  setNotification(notification.filter((n) => n !== notif));
                }}
              >
                {notif.chat.isGroupChat
                  ? `New Message in ${notif.chat.chatName}`
                  : `New Message from ${getSender(user, notif.chat.users)}`}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <Menu>
          <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
          </MenuButton>
          <MenuList>
            <Profile user={user.data}>
              <MenuItem>My Profile</MenuItem>
            </Profile>
            <MenuItem onClick={logOutHandler}>Log Out</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* Sidebar opening from left */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay /> 
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>

          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loadingUser ? (
              <ChatSkeleton />
            ) : (
              searchUser?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Header;
