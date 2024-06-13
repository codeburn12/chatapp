import { ViewIcon } from "@chakra-ui/icons";
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
    FormControl,
    Input,
    useToast,
    Box,
    IconButton,
    Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../Header/UserBadgeItem";
import UserListItem from "../Header/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const toast = useToast();

    const { selectChat, setSelectChat, user } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
            };
            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            setLoading(false);
        }
    };

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/rename`,
                {
                    chatId: selectChat._id,
                    chatName: groupChatName,
                },
                config
            );

            setSelectChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setRenameLoading(false);
        }
        setGroupChatName("");
    };

    const handleAddUser = async (user1) => {
        if (selectChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
        if (selectChat.groupAdmin._id !== user.data._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/addgroup`,
                {
                    chatId: selectChat._id,
                    userId: user1._id,
                },
                config
            );

            setSelectChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    };

    const handleRemove = async (user1) => {
        if (selectChat.groupAdmin._id !== user.data._id && user1._id !== user.data._id) {
            toast({
                title: "Only admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/removegroup`,
                {
                    chatId: selectChat._id,
                    userId: user1._id,
                },
                config
            );
            // console.log("data", data)
            // console.log("user", user.data._id === user1.data._id)
            // console.log("user1", user1.data._id)
            // console.log("user1", user1.data._id)
            // console.log("selectchat", selectChat)
            user1._id === user._id ? setSelectChat() : setSelectChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                // description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    };

    return (
        <>
            <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        d="flex"
                        justifyContent="center"
                    >
                        {selectChat.chatName}
                    </ModalHeader>

                    <ModalCloseButton />
                    <ModalBody d="flex" flexDir="column" alignItems="center">
                        <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
                            {selectChat.users.map((u) => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    admin={selectChat.groupAdmin}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))}
                        </Box>
                        <FormControl d="flex">
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameloading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add User to group"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>

                        {loading ? (
                            <Spinner size="lg" />
                        ) : (
                            searchResult?.map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => handleAddUser(user)}
                                />
                            ))
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => handleRemove(user)} colorScheme="red">
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateGroupChatModal;