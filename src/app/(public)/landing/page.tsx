"use client";

import { Box, Text, Button, Grid, Input, IconButton, Center, calc, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, DrawerFooter, useDisclosure, useColorMode, Flex } from "@chakra-ui/react"
import { RiLockFill, RiCheckboxCircleLine, RiLightbulbLine, RiCloudLine, RiSpamLine, RiWebcamLine, RiFacebookBoxFill, RiFacebookLine, RiTwitterFill, RiInstagramLine, RiPhoneFill, RiMailFill, RiMapPinFill } from "react-icons/ri"
import Aos from "aos";
import "aos/dist/aos.css";
import { useRef, useEffect } from "react";
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from "./components/Footer";
import Link from 'next/link';

export default function LandingPage() {
    const aboutDr = useRef(null);
    const aboutPr = useRef(null);
    const contact = useRef(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { toggleColorMode } = useColorMode();

    useEffect(() => {
        Aos.init({ duration: 1000 });
    }, []);

    return (
        <Box display='flex' flexDirection='column' bg='#080429' color='#ffffff' fontFamily='Montserrat' w='100vw'>
            <Box backgroundImage='/Img/cyberbg.jpg' h='1000px' w='100vw' backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' ></Box>

            <Box
                data-aos="fade-up"
                fontSize={{ base: '85px', md: '120px' }}
                position={{ base: 'absolute', lg: 'fixed' }}
                fontWeight="bold"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                display="flex"
                w="100vw"
                h={{ base: "50vh", md: "50vh", lg:"40vh" }}
                mt="0"
            >
                <Box
                    backgroundImage="/Img/logo.png"
                    h="250px"
                    w="250px"
                    m="20px"
                    backgroundSize="cover"
                    backgroundRepeat="no-repeat"
                    backgroundPosition="center"
                ></Box>
            </Box>
            <Box backgroundImage='/Img/cyberearth.png' position='absolute' h='1000px' w='100vw' backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' ></Box>

            <Box onLoad={toggleColorMode} display='flex' gap='100px' justifyContent='center' position='absolute' w='100vw' color='#ffffff' fontFamily='Montserrat' mt='20px'>
                {/* <Box backgroundImage='/Img/logoELCSinc.png' h='75px' w='150px' m='20px' backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' ></Box> */}

            </Box>
            <Header/>
            <Box position='absolute' w='100vw' mt='420px' h='auto'>
                <Box
                    justifyContent="center"
                    textAlign="center"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                >
                    <Box
                        backgroundImage="/Img/logofont.png"
                        h="200px"
                        w="420px"
                        backgroundSize="cover"
                        backgroundRepeat="no-repeat"
                        backgroundPosition="center"

                    ></Box>

                    <Box p={{ base: '10px', md: '0px' }}>
                        <p>Your AI Platform. Automate tasks, solve problems, and streamline your workflow effortlessly.</p>
                    </Box>

                    <Button
                        variant="outline"
                        mt="20px"
                        borderRadius="40px"
                        width="160px"
                        color="white"
                        borderColor="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                    >
                        Get Started
                    </Button>
                </Box>

                <Box display='flex' gap='70px' justifyContent='center' mt='50px' flexDirection={{ base: 'column', md: 'row' }} p={{ base: '60px', md: '0px' }}>
                    <Box display='flex' data-aos="fade-up" data-aos-once="true">
                        <Box backgroundImage='/Img/reliability.png' h={{ base: '65px', md: '68px' }} w={{ base: '78px', md: '78px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' ></Box>
                        <Box ml='10px' justifyContent='left' textAlign='left'>
                            <Text>Trusted by</Text>
                            <Box display='flex' mt='-20px'>
                                <Text fontSize='55px' fontWeight={'bold'}>12</Text>
                                <Box ml='10px' mt='18px' fontWeight={'bold'}><Text>Top Australian</Text>
                                    <Text >companies</Text></Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box display='flex' data-aos="fade-up" data-aos-once="true">
                        <Box backgroundImage='/Img/time.png' h={{ base: '65px', md: '65px' }} w={{ base: '65px', md: '65px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' ></Box>
                        <Box ml='10px' justifyContent='left' textAlign='left'>
                            <Text>Delevering</Text>
                            <Box display='flex' mt='-20px'>
                                <Text fontSize={{ base: '40px', md: '55px' }} mt={{ base: '20px', md: '0px' }} fontWeight={'bold'}>100+</Text>
                                <Box ml='10px' mt='18px' fontWeight={'bold'}><Text>Project</Text>
                                    <Text >Solutions</Text></Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box display='flex' data-aos="fade-up" data-aos-once="true">
                        <Box backgroundImage='/Img/trust.png' h={{ base: '65px', md: '65px' }} w={{ base: '70px', md: '70px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' ></Box>
                        <Box ml='10px' justifyContent='left' textAlign='left'>
                            <Text>Tested by</Text>
                            <Box display='flex' mt='-20px'>
                                <Text fontSize='55px' mt='0px' fontWeight={'bold'}>2K+</Text>
                                <Box ml='10px' mt='18px' fontWeight={'bold'}><Text>AI</Text>
                                    <Text >Solutions</Text></Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box bg='#080429' ref={aboutPr}>

                    {/* <Process /> */}

                    <Box justifyContent='center' textAlign='center' mt='50px' p={{ base: '10px', md: '0px' }} ><Text data-aos="fade-right" data-aos-once="true" fontSize='30px' fontWeight={'bold'}>Why choose Ajentify ?</Text>
                        <Text fontSize='20px' data-aos="fade-right" data-aos-once="true">We Are Pushing the Boundaries of Autonomous Technology. This Is How.</Text></Box>

                    <Box justifyContent='center' gap='30px' display='flex' fontSize='15px' textAlign='center' mt='30px' ml={{ base: '0px', lg: '0px' }} >
                        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap='20px'>
                            <Box backgroundImage='/Img/boxx.png' data-aos="flip-up" data-aos-once="true" h={{ base: '400px', lg: '500px' }} w={{ base: '300px', lg: '375px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' justifyContent='center' textAlign='center'>
                                <Box backgroundImage='/Img/r1.png' h={{ base: '160px', lg: '250px' }} w={{ base: '270x', lg: '300px' }} ml={{ base: '0x', md: '30px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center'></Box>
                                <Text fontSize='20px' data-aos="fade-right" fontWeight={'bold'} data-aos-once="true" mb={'10px'}>Custom AI Agents</Text>
                                <Box mt='0px' mb={{ base: '50px', md: '30px' }} m='10px'> <p >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standad dummy text ever since the 1500s.</p></Box>
                                <Center> <Button display={{ base: 'none', lg: 'block' }} borderRadius='10px' bg='#1252B8' size='xs' variant='solid' h='40px' w='100px'>More</Button></Center>
                            </Box>
                            <Box backgroundImage='/Img/boxx.png' data-aos="flip-down" data-aos-once="true" h={{ base: '400px', lg: '500px' }} w={{ base: '300px', lg: '375px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' justifyContent='center' textAlign='center'>
                                <Box backgroundImage='/Img/r2.png' h={{ base: '160px', lg: '250px' }} w={{ base: '250x', lg: '300px' }} ml={{ base: '0x', md: '30px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center'></Box>
                                <Text fontSize='20px' data-aos="fade-right" fontWeight={'bold'} data-aos-once="true" mb={'10px'}>Automated workflow</Text>
                                <Box mt={{ base: '20px', md: '0px' }} p='10px' m='10px' > <p >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standad dummy text ever since the 1500s.</p></Box>
                                <Center> <Button display={{ base: 'none', lg: 'block' }} borderRadius='10px' bg='#1252B8' size='xs' variant='solid' h='40px' w='100px'>More</Button></Center>
                            </Box>
                            <Box backgroundImage='/Img/boxx.png' data-aos="flip-up" data-aos-once="true" h={{ base: '400px', lg: '500px' }} w={{ base: '300px', lg: '375px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' justifyContent='center' textAlign='center'>
                                <Box backgroundImage='/Img/r3.png' h={{ base: '190px', lg: '250px' }} w={{ base: '270x', lg: '300px' }} ml={{ base: '0x', lg: '30px' }} mt={{ base: '0x', lg: '30px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center'></Box>

                                <Box mt='-30px' mb='30px' p='10px'>
                                    <Text fontSize='20px' data-aos="fade-right" fontWeight={'bold'} data-aos-once="true" mb={'10px'}>Multi-Channel Messaging</Text>
                                    <p >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standad dummy text ever since the 1500s.</p></Box>
                                <Center> <Button display={{ base: 'none', lg: 'block' }} borderRadius='10px' bg='#1252B8' size='xs' variant='solid' h='40px' w='100px'>More</Button></Center>
                            </Box>
                        </Grid>
                    </Box>

                    <Box
                        justifyContent="center"
                        textAlign="center"
                        width="90vw"
                        alignItems="center"
                        display="flex"
                        flexDirection="column"
                        mx="auto" // Centers the Box horizontally within the viewport
                    >
                        <Text
                            fontSize="30px"
                            fontWeight="bold"
                            mt="70px"
                            data-aos="fade-right"
                            data-aos-once="true"
                        >
                            Our Research Leads Us to Believe…
                        </Text>

                        <Text
                            fontSize="15px"
                            data-aos="fade-right"
                            data-aos-once="true"
                            mt="20px"
                            lineHeight="1.8"
                            maxWidth="1000px"
                        >
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. <br /><br />

                            Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet...", comes from a line in section 1.10.32.
                        </Text>
                    </Box>




                </Box>
                <Box backgroundImage='/Img/cyberbg2.jpg' h={{ base: '1600px', md: '900px' }} w='100vw' backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' >


                    <Box display='flex' justifyContent='center' flexDirection={{ base: 'column', lg: 'row' }} ml={{ base: '5px', md: '0px' }} >
                        <Grid templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap='10px' mt={'40px'}>
                            <Box justifyContent='center' textAlign='center'>
                                <Center><Box backgroundImage='/Img/poly1.png' data-aos="flip-left" data-aos-once="true" h={{ base: '150px', md: '200px' }} w={{ base: '150px', md: '200px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' p={{ base: '40px', md: '65px' }} ml='10px' ><RiLightbulbLine className='text1' size='70px' color='#6B0AEA' /></Box></Center>
                                <Text fontSize='20px' mt='0px' data-aos="fade-up" data-aos-once="true">Data <br /> Vulnerability</Text>
                                <Text fontSize='14px' mt='40px' fontWeight='normal' data-aos="fade-up" data-aos-once="true">Check the Quantity<br />
                                    and the nature of the <br />
                                    Vulnerability</Text>
                            </Box>

                            <Box justifyContent='center' textAlign='center' mt='20px'>
                                <Text fontSize='20px' mt='0px' data-aos="fade-down" data-aos-once="true">Assess the <br /> Risk</Text>
                                <Center><Box backgroundImage='/Img/poly1.png' data-aos="flip-left" data-aos-once="true" h={{ base: '150px', md: '200px' }} w={{ base: '150px', md: '200px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' p={{ base: '40px', md: '65px' }} ml='10px'><RiCloudLine className='text1' size='70px' color='#6B0AEA' /></Box></Center>

                                <Text fontSize='14px' mt='15px' fontWeight='normal' data-aos="fade-up" data-aos-once="true">Examine the<br />
                                    Exitance of risk</Text>
                            </Box>


                            <Box justifyContent='center' textAlign='center'>
                                <Center><Box backgroundImage='/Img/poly1.png' data-aos="flip-left" data-aos-once="true" h={{ base: '150px', md: '200px' }} w={{ base: '150px', md: '200px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' p={{ base: '40px', md: '65px' }} ml='10px'><RiSpamLine className='text1' size='70px' color='#6B0AEA' /></Box></Center>
                                <Text fontSize='20px' mt='0px' data-aos="fade-up" data-aos-once="true">Prioritize <br /> Remediation</Text>
                                <Text fontSize='14px' mt='40px' fontWeight='normal' data-aos="fade-up" data-aos-once="true">Set the priority<br />
                                    of fixing <br />
                                    Vulnerability</Text>
                            </Box>

                            <Box justifyContent='center' textAlign='center' mt='20px'>
                                <Text fontSize='20px' mt='0px' data-aos="fade-down" data-aos-once="true">Conform <br /> Remediation</Text>
                                <Center><Box backgroundImage='/Img/poly1.png' data-aos="flip-left" data-aos-once="true" h={{ base: '150px', md: '200px' }} w={{ base: '150px', md: '200px' }} backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' p={{ base: '40px', md: '65px' }} ml='10px'><RiWebcamLine className='text1' size='70px' color='#6B0AEA' /></Box></Center>

                                <Text fontSize='14px' mt='15px' fontWeight='normal' data-aos="fade-up" data-aos-once="true">Re scan,<br /> conform and reoprt</Text>
                            </Box>
                        </Grid>
                    </Box>

                    <Box mt='50px' ><Footer /></Box>

                </Box>
            </Box>

            {/* <Header />
 <HeroSection />
 <FeaturesSection /> */}
        </Box>
    );
}