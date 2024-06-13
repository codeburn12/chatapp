import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormControl, FormLabel, VStack } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { Button } from "@chakra-ui/button";
import { useToast } from "@chakra-ui/react";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [pic, setPic] = useState("");
  const toast = useToast();
  let navigate = useNavigate();

  // Show/hide the password
  const handleShowPasswordClick = () => setShowPassword(!showPassword);

  // Show/hide the confirm password
  const handleShowConfirmPassClick = () => setShowConfirmPass(!showConfirmPass);

  // Upload Image on cloudinary
  const postImage = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chatapp");
      data.append("cloud_name", "dc0gfvucc");
      fetch("https://api.cloudinary.com/v1_1/dc0gfvucc/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url);
          setPicLoading(false);
        })
        .catch((err) => {
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  // Submitting the form
  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmPass) {
      toast({
        title: "Please fill all details",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (password !== confirmPass) {
      toast({
        title: "Please fill correct password",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        { headers: { "content-type": "application/json" } }
      );
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
  };

  return (
    <VStack spacing="0.2rem" color="black">
      <FormControl isRequired>
        <FormLabel id="full-name">Name</FormLabel>
        <Input
          type="text"
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
              {!showPassword ? (
                <AiOutlineEyeInvisible
                  size={20}
                onClick={() => setShowPassword(true)}
                  cursor="pointer"
                />
              ) : (
                <AiOutlineEye
                  size={20}
                  onClick={() => setShowPassword(false)}
                  cursor="pointer"
                />
              )}
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={showConfirmPass ? "text" : "password"}
            placeholder="Confirm password"
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <InputRightElement width="4.5rem">
              {!showConfirmPass ? (
                <AiOutlineEyeInvisible
                  size={20}
                  onClick={() => setShowConfirmPass(true)}
                  cursor="pointer"
                />
              ) : (
                <AiOutlineEye
                  size={20}
                    onClick={() => setShowConfirmPass(false)}
                  cursor="pointer"
                />
              )}
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postImage(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
