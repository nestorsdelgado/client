import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    TextField,
    Paper,
    Avatar,
    Divider,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { SmartToy, Close, Send } from '@mui/icons-material';
import geminiService from '../../services/gemini.service';

const GeminiChatButton = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: 'Hola, soy tu asistente de LEC Fantasy Manager. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre estrategias, jugadores, equipos o cualquier duda que tengas sobre cómo jugar mejor.',
            timestamp: new Date()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Send message to backend API through the service
    const getGeminiResponse = async (userMessage) => {
        setIsTyping(true);
        try {
            // Use the service to communicate with the backend
            const response = await geminiService.sendMessage(
                userMessage,
                messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            );

            return response.response;
        } catch (error) {
            console.error('Error getting Gemini response:', error);
            // Error handling is now managed by the service
            throw error;
        } finally {
            setIsTyping(false);
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;

        // Add user message
        const userMessage = {
            role: 'user',
            content: newMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        try {
            // Get bot response
            const response = await getGeminiResponse(newMessage);

            // Add bot response
            const botMessage = {
                role: 'bot',
                content: response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            setError(err.message);

            // Add error message as bot message to keep conversation flow
            const errorMessage = {
                role: 'bot',
                content: 'Lo siento, ha ocurrido un error: ' + err.message,
                timestamp: new Date(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCloseError = () => {
        setError(null);
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <>
            <Fab
                color="primary"
                aria-label="chat"
                onClick={handleOpen}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    left: 20,
                    zIndex: 1000,
                    backgroundColor: '#1976d2',
                    '&:hover': {
                        backgroundColor: '#1565c0'
                    }
                }}
            >
                <SmartToy />
            </Fab>

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        maxHeight: '80vh',
                        height: '600px',
                        width: '350px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#1A2634',
                        color: 'white'
                    }
                }}
            >
                <DialogTitle sx={{
                    p: 2,
                    backgroundColor: '#0A1428',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box display="flex" alignItems="center">
                        <SmartToy sx={{ mr: 1 }} />
                        <Typography variant="h6">Fantasy LEC Assistant</Typography>
                    </Box>
                    <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <DialogContent sx={{
                    p: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    overflow: 'hidden'
                }}>
                    <Box
                        sx={{
                            p: 2,
                            flexGrow: 1,
                            overflow: 'auto',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    mb: 2,
                                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%'
                                }}
                            >
                                {message.role === 'bot' && (
                                    <Avatar
                                        sx={{
                                            bgcolor: message.isError ? '#f44336' : '#1976d2',
                                            width: 32,
                                            height: 32,
                                            mr: 1,
                                            mt: 0.5
                                        }}
                                    >
                                        <SmartToy fontSize="small" />
                                    </Avatar>
                                )}

                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: '12px',
                                        backgroundColor: message.role === 'user'
                                            ? '#1976d2'
                                            : message.isError
                                                ? 'rgba(244, 67, 54, 0.1)'
                                                : 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    <Typography variant="body2">{message.content}</Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                            mt: 0.5,
                                            textAlign: message.role === 'user' ? 'right' : 'left',
                                            opacity: 0.7
                                        }}
                                    >
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Paper>

                                {message.role === 'user' && (
                                    <Avatar
                                        sx={{
                                            bgcolor: '#4CAF50',
                                            width: 32,
                                            height: 32,
                                            ml: 1,
                                            mt: 0.5
                                        }}
                                    >
                                        {message.role.charAt(0).toUpperCase()}
                                    </Avatar>
                                )}
                            </Box>
                        ))}

                        {isTyping && (
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 5 }}>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    El asistente está escribiendo...
                                </Typography>
                            </Box>
                        )}

                        <div ref={messagesEndRef} />
                    </Box>

                    <Box sx={{
                        p: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        display: 'flex'
                    }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Escribe un mensaje..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isTyping}
                            multiline
                            maxRows={3}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#1976d2',
                                    },
                                },
                                '& .MuiInputBase-input::placeholder': {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    opacity: 1,
                                },
                            }}
                        />
                        <IconButton
                            onClick={handleSendMessage}
                            disabled={isTyping || newMessage.trim() === ''}
                            sx={{
                                ml: 1,
                                color: 'white',
                                bgcolor: '#1976d2',
                                '&:hover': {
                                    bgcolor: '#1565c0',
                                },
                                '&.Mui-disabled': {
                                    bgcolor: 'rgba(25, 118, 210, 0.5)',
                                }
                            }}
                        >
                            <Send />
                        </IconButton>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Error snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseError} severity="error" variant="filled">
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};

export default GeminiChatButton;