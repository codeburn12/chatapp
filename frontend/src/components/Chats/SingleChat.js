import React, { useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { ChatState } from '../../context/ChatProvider'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../../config/ChatLogics'
import Profile from '../Header/Profile'
import UpdateGroupChatModal from './UpdateGroupChatModal'
import { Spinner, FormControl, Input } from '@chakra-ui/react'
import ScrollableChat from './ScrollableChat'
import { Text, IconButton, Box } from '@chakra-ui/react'
import io from "socket.io-client"
import Lottie from "react-lottie"
import animationData from "../../animations/Typing.json";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [newMessage, setNewMessage] = useState('')    // To send message
    const [message, setMessage] = useState([])
    const [loading, setLoading] = useState(false)
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const { user, selectChat, setSelectChat, notification, setNotification } = ChatState()
    
    const toast = useToast()

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const fetchMessages = async () => {
        if (!selectChat) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.data.token}` } }
            setLoading(true)
            const { data } = await axios.get(`/api/message/${selectChat._id}`, config)

            setMessage(data)
            setLoading(false)
            socket.emit('join chat', selectChat._id)    
        } catch (error) {
            toast({
                title: "Error Occured",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }
    }
    useEffect(() => {
        socket = io();
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [])

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectChat;
    }, [selectChat]);
    console.log("notification", notification)
    
    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessage([...message, newMessageRecieved]);
            }
        });
    });

    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectChat._id);
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.data.token}`, "content-type": "application/json" },
                }
                setNewMessage("")
                const { data } = await axios.post('/api/message', { content: newMessage, chatId: selectChat._id }, config)
                
                socket.emit("new message", data)
                setMessage([...message, data])

            } catch (error) {
                toast({
                    title: "Message not send",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }

    }

    
    

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        // Typing indicator logic
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    

    return (
        <>
            {selectChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        d="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            d={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectChat("")}
                        />
                        {message &&
                            (!selectChat.isGroupChat ? (
                                <>
                                    {getSender(user, selectChat.users)}
                                    <Profile
                                        user={getSenderFull(user, selectChat.users)}
                                    />
                                </>
                            ) : (
                                <>
                                    {selectChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal
                                        fetchMessages={fetchMessages}
                                        fetchAgain={fetchAgain}
                                        setFetchAgain={setFetchAgain}
                                    />
                                </>
                            ))}
                    </Text>
                    <Box
                        d="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'scroll', scrollbarWidth: 'none' }}>
                                <ScrollableChat messages={message} />
                            </div>

                        )}
                        {isTyping ? <div>
                            <Lottie
                                options={defaultOptions}
                                // height={50}
                                width={70}
                                style={{ marginBottom: 15, marginLeft: 0 }}
                            />
                        </div> : <></>}
                        <FormControl
                            onKeyDown={sendMessage}
                            id="first-name"
                            isRequired
                            mt={3}
                        >
                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                                value={newMessage}
                                onChange={typingHandler}
                            />
                        </FormControl>
                    </Box>
                </>
            ) : (
                // to get socket.io on same page
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Click on a user to start chatting
                    </Text>
                </div>
            )}
        </>
    )
}

export default SingleChat