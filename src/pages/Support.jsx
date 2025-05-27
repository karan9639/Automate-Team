// "use client"

// import { useState, useEffect } from "react"
// import { useLocation } from "react-router-dom"
// import { Box, Container, Typography, Button, Modal, TextField } from "@mui/material"

// const Support = () => {
//   const [isRaiseTicketModalOpen, setIsRaiseTicketModalOpen] = useState(false)
//   const [ticketDetails, setTicketDetails] = useState({
//     subject: "",
//     description: "",
//   })

//   // Add useLocation and useEffect to handle query parameters
//   const location = useLocation()

//   useEffect(() => {
//     // Check if the URL has the action=raise query parameter
//     const searchParams = new URLSearchParams(location.search)
//     if (searchParams.get("action") === "raise") {
//       setIsRaiseTicketModalOpen(true)
//     }
//   }, [location.search])

//   const handleOpenRaiseTicketModal = () => {
//     setIsRaiseTicketModalOpen(true)
//   }

//   const handleCloseRaiseTicketModal = () => {
//     setIsRaiseTicketModalOpen(false)
//   }

//   const handleInputChange = (e) => {
//     setTicketDetails({
//       ...ticketDetails,
//       [e.target.name]: e.target.value,
//     })
//   }

//   const handleSubmitTicket = () => {
//     // Implement your ticket submission logic here
//     console.log("Submitting ticket:", ticketDetails)
//     handleCloseRaiseTicketModal()
//   }

//   return (
//     <Container maxWidth="md">
//       <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
//         <Typography variant="h4" component="h1" gutterBottom>
//           Support
//         </Typography>
//         <Typography variant="body1" align="center" paragraph>
//           Need help? Contact our support team or raise a ticket.
//         </Typography>
//         <Button variant="contained" onClick={handleOpenRaiseTicketModal}>
//           Raise a Ticket
//         </Button>

//         <Modal
//           open={isRaiseTicketModalOpen}
//           onClose={handleCloseRaiseTicketModal}
//           aria-labelledby="raise-ticket-modal"
//           aria-describedby="modal-to-raise-a-support-ticket"
//         >
//           <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: 400,
//               bgcolor: "background.paper",
//               border: "2px solid #000",
//               boxShadow: 24,
//               p: 4,
//             }}
//           >
//             <Typography id="raise-ticket-modal" variant="h6" component="h2">
//               Raise a Support Ticket
//             </Typography>
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               id="subject"
//               label="Subject"
//               name="subject"
//               autoComplete="subject"
//               value={ticketDetails.subject}
//               onChange={handleInputChange}
//             />
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               id="description"
//               label="Description"
//               name="description"
//               multiline
//               rows={4}
//               autoComplete="description"
//               value={ticketDetails.description}
//               onChange={handleInputChange}
//             />
//             <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
//               <Button onClick={handleCloseRaiseTicketModal}>Cancel</Button>
//               <Button variant="contained" onClick={handleSubmitTicket}>
//                 Submit Ticket
//               </Button>
//             </Box>
//           </Box>
//         </Modal>
//       </Box>
//     </Container>
//   )
// }

// export default Support
