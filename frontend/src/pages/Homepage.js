import {
  Box,
  Image,
  Button,
  ButtonGroup,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Link
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useNavigate } from "react-router-dom";
import CustomTheme from "../customtheme/CustomTheme";

function Homepage() {

  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Box width="100vw" padding="2rem 4rem">
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap="0.4rem">
          <Link href="/" _hover={{ textDecoration: 'none' }}>
            <Text paddingBottom="8px" fontSize="2rem" color="#ffffff" fontWeight="600" cursor="pointer">
              Howdy
            </Text>
          </Link>
          <Box borderRadius="6px" height="30px" width="3px" backgroundColor="#6871F4"></Box>
          <Text fontSize="1rem" color="#ffffff" fontWeight="600">
            chat with ease
          </Text>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Text fontSize="4rem" color="#ffffff" fontWeight="600" lineHeight="4.4rem">
            Have your best chat
          </Text>
          <Text fontSize="1.5rem" color="#F4F3FA" fontWeight="400" lineHeight="4.4rem">
            Fast, Easy and Unlimited Team Chat
          </Text>

          <Box display="flex" alignItems="center" justifyContent="center" paddingTop="1rem">
            <Box bg="white" w="60%" p={4} borderRadius="lg" borderWidth="1px">
              <Tabs isFitted variant="soft-rounded">
                <TabList mb="1em">
                  <Tab>Login</Tab>
                  <Tab>Sign Up</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Login />
                  </TabPanel>
                  <TabPanel>
                    <Signup />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Box>
          

        </Box>
        <Box minW="20vw">
          <Image src='/frontPage.png' alt='Dan Abramov' height="600px"/>
        </Box>
      </Box>


    </Box>
  );
}

export default Homepage;
