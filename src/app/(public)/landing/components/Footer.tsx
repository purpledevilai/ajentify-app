'use client';
import { Box, Text, Button, Grid, Input, Center, IconButton } from "@chakra-ui/react"
import { RiLockFill, RiLightbulbLine, RiCloudLine, RiSpamLine, RiWebcamLine, RiFacebookBoxFill, RiFacebookLine, RiTwitterFill, RiInstagramLine, RiPhoneFill, RiMailFill, RiMapPinFill } from "react-icons/ri"



const Footer = () => {
return(
    <Box p='70px'  color='#ffffff' fontFamily='Montserrat' mt='20px' ml={{base:'0px', md:'30px'}}>
        <Grid templateColumns={{base:'repeat(1, 1fr)', md:'repeat(2, 1fr)', lg:'repeat(3, 1fr)'}}  gap='70px'>
        <Box mt={'40px'}>
        <Box backgroundImage='/Img/logofont.png' h='75px' w='170px' backgroundSize='cover' backgroundRepeat='no-repeat' backgroundPosition='center' ></Box>

        <Text mt='15px' fontSize='12px'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's<br/>

Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's</Text> 

        
        </Box>

        <Box display={{ base: 'none', lg: 'block' }} mt={'40px'}>

        <Text fontSize='20px' mt='20px'>KEEP IN TOUCH</Text>

        <Text mt='5px' fontSize='12px'>Join our newsletter subscription and <br/>stay updated with the the digital world.</Text> 
        <Box display='flex' mt='20px'><Input placeholder='Your Email' borderLeftRadius='30px' variant='filled' size='xs' h='30px'></Input><Button borderRightRadius='30px' borderLeftRadius='0px' bg='#1252B8' size='xs' variant='solid' h='30px'  w='130px'> Send </Button></Box>

        </Box>

        

        <Box>
        <Text fontSize='16px' mt={{base:'-10px', md:'40px'}}>Contact Us</Text>
        <Box display='flex' gap='10px' mt='20px'><RiPhoneFill size='20px' /><Text >+61 123 456 7891</Text></Box>
        <Box display='flex' gap='10px'mt='20px'><RiMailFill size='20px' /><Text >info@ajentify.com</Text></Box>
        <Box display='flex' gap='10px'mt='20px'><RiMapPinFill size='20px' /><Text >123, Clayton, VIC 3168 Australia.</Text></Box>

<Box display='flex' gap='10px' mt='10px'>
    <IconButton  size='sm'><RiFacebookLine/></IconButton>
    <IconButton  size='sm'><RiTwitterFill/></IconButton>
    <IconButton  size='sm'><RiInstagramLine/></IconButton>
</Box>


        </Box>

        </Grid>

        <Center><Text mt='20px' fontSize='12px'>Copyright © 2025 All rights reserved by www.ajentify.com</Text></Center>

        
        
        </Box>
    
)
};

export default Footer;