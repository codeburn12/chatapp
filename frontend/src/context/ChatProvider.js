import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

// All state management happen here
const ChatContext = createContext();

// Must be under BrowserRouter
const ChatProvider = ({ children }) => {
  // All state can be acess by any component which should be defined in value, if not then it is acessible to this component only
  const [user, setUser] = useState();       // Particular User
  const [notification, setNotification] = useState([]);
  const [chat, setChat] = useState([]);       // one chat
  const [selectChat, setSelectChat] = useState()    // All chat of user

  const navigate = useNavigate();

  useEffect(() => {
    // Check for user login if it exist in local storage or not
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        chat,
        setChat,
        notification,
        setNotification,
        selectChat,
        setSelectChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;

