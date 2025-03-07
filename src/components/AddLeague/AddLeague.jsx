import React, { useState } from "react";
import leagueService from "../../services/leagues.service";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

export default function AddLeague({ open, onClose, onLeagueAdded }) {
    const [nombre, setNombre] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            alert("Please enter a league name!");
            return;
        }

        try {
            // Send only "Nombre" to the backend (ID is auto-generated)
            const newLeague = { Nombre: nombre };

            console.log("Posting league:", newLeague); // Debugging output

            // Call the API
            const response = await leagueService.createLeague(newLeague);
            console.log("League created successfully:", response);

            onLeagueAdded(response.league); // Refresh league list
            setNombre(""); // Clear input field
            onClose(); // Close modal
        } catch (error) {
            alert("Error creating league. Check console for details.");
            console.error("Error creating league:", error.response?.data || error);
        }
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "white",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: "10px",
                }}
            >
                <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                    Añadir Nueva Liga
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Nombre de la liga"
                        variant="outlined"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box display="flex" justifyContent="space-between">
                        <Button variant="contained" color="error" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            Crear Liga
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
}
