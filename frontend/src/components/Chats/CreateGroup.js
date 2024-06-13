import React, { useState } from "react";
import {ChatState} from "../../context/ChatProvider";
import axios from "axios";
import UserBadgeItem from "../Header/UserBadgeItem";
import UserListItem from "../Header/UserListItem";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  useToast,
  Box,
  Input,
  FormControl,
} from "@chakra-ui/react";

const CreateGroup = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const { user, chat, setChat } = ChatState();

  const [groupName, setGroupName] = useState(); // Create new group
  const [addUser, setAddUser] = useState([]); // add user in group
  const [search, setSearch] = useState(""); // For query to API
  const [searchResult, setSearchResult] = useState([]); // on search query,
  const [loading, setLoading] = useState(false);

  const handleAddUser = (userId) => {
    if(addUser.includes(userId)) {
      toast({
        title: "User already added",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    setAddUser([...addUser, userId])
  };

  const handleSearch = async (query) => {
    setSearch(query)
    if (!query) {
      return;
    }
    
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.data.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data)
      setLoading(false)
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to search result(creteGroup)",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleDelete = (deleteUser) => {
    setAddUser(addUser.filter((del)=> del._id !== deleteUser._id))
  };

  const handleSubmit = async () => {
    if (!groupName || !addUser) {
      toast({
        title: "Fill all details",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.data.token}`,
        },
      }
      
      const { data } = await axios.post(`/api/chat/group`, {
        name: groupName,
        users: JSON.stringify(addUser.map((u) => u._id))
      }, config)
      
      setChat([data, ...chat])
      onClose()
      toast({
        title: "Group created",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Group not created",
        description: error.response.data,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" d="flex" flexWrap="wrap">
              {addUser.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>
            {loading ? (
              <div>Loading...</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleAddUser(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateGroup;
