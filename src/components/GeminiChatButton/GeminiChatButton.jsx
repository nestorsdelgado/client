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
    Alert,
    Tooltip,
    Badge,
    LinearProgress,
    Link
} from '@mui/material';
import {
    SmartToy,
    Close,
    Send,
    InfoOutlined,
    Report,
    Warning,
    ErrorOutline
} from '@mui/icons-material';
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
    const [infoSnackbar, setInfoSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [requestsPending, setRequestsPending] = useState(0);
    const [showUsageInfo, setShowUsageInfo] = useState(false);
    const [messageCounter, setMessageCounter] = useState(0);  // Contador para tracking de uso
    const [contentWarning, setContentWarning] = useState(null);
    const messagesEndRef = useRef(null);

    // Añadir efectos de sonido (opcional)
    const messageSentSound = useRef(new Audio('/sounds/message-sent.mp3'));
    const messageReceivedSound = useRef(new Audio('/sounds/message-received.mp3'));
    const errorSound = useRef(new Audio('/sounds/error.mp3'));

    // Restablecer contador de mensajes cada hora para limitar uso
    useEffect(() => {
        const resetInterval = setInterval(() => {
            if (messageCounter > 0) {
                setMessageCounter(0);
                setInfoSnackbar({
                    open: true,
                    message: 'El contador de mensajes se ha restablecido.',
                    severity: 'info'
                });
            }
        }, 60 * 60 * 1000); // 1 hora
        
        return () => clearInterval(resetInterval);
    }, [messageCounter]);

    // Análisis y validación de contenido
    const validateMessage = (message) => {
        // Detectar posible contenido sensible o inapropiado
        const sensitivePatterns = [
            { pattern: /\b(hack|exploit|cheat)\b/i, warning: 'Tu mensaje podría estar relacionado con hacer trampa. Por favor, recuerda que promovemos el juego limpio.' },
            { pattern: /\b(personal|private|email|password)\b/i, warning: 'Evita compartir información personal en el chat.' },
            { pattern: /\b(http|www\.|\.com|\.net|\.org)\b/i, warning: 'Por seguridad, el asistente no puede abrir enlaces externos.' }
        ];

        for (const { pattern, warning } of sensitivePatterns) {
            if (pattern.test(message)) {
                setContentWarning(warning);
                return false;
            }
        }

        setContentWarning(null);
        return true;
    };

    // Send message to backend API through the service
    const getGeminiResponse = async (userMessage) => {
        setIsTyping(true);
        setRequestsPending(prev => prev + 1);
        
        try {
            // Use the service to communicate with the backend
            const response = await geminiService.sendMessage(
                userMessage,
                messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            );

            // Reproducir sonido de mensaje recibido (si está habilitado)
            messageReceivedSound.current.volume = 0.2;
            messageReceivedSound.current.play().catch(e => console.log("Sound play prevented by browser."));

            // Incrementar contador de uso
            setMessageCounter(prevCount => prevCount + 1);

            return response.response;
        } catch (error) {
            console.error('Error getting Gemini response:', error);
            
            // Reproducir sonido de error (si está habilitado)
            errorSound.current.volume = 0.3;
            errorSound.current.play().catch(e => console.log("Sound play prevented by browser."));
            
            throw error;
        } finally {
            setIsTyping(false);
            setRequestsPending(prev => prev - 1);
        }
    };

    const handleOpen = () => {
        setOpen(true);
        
        // Información transparente sobre el uso
        if (!localStorage.getItem('geminiInfoShown')) {
            setTimeout(() => {
                setInfoSnackbar({
                    open: true,
                    message: 'Este asistente utiliza IA generativa de Google Gemini. Tus mensajes se procesan para ofrecer respuestas personalizadas.',
                    severity: 'info'
                });
                localStorage.setItem('geminiInfoShown', 'true');
            }, 1000);
        }
    };

    const handleClose = () => {
        setOpen(false);
        
        // Si estaba escribiendo un mensaje cuando cerró, limpiar estado
        if (isTyping) {
            setIsTyping(false);
            setInfoSnackbar({
                open: true,
                message: 'Se ha cancelado la respuesta en progreso.',
                severity: 'warning'
            });
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;
        
        // Validar contenido del mensaje
        if (!validateMessage(newMessage)) {
            setInfoSnackbar({
                open: true,
                message: contentWarning || 'Por favor, revisa el contenido de tu mensaje.',
                severity: 'warning'
            });
            return;
        }

        // Límite de uso: máximo 20 mensajes por hora
        if (messageCounter >= 20) {
            setInfoSnackbar({
                open: true,
                message: 'Has alcanzado el límite de 20 mensajes por hora. Por favor, intenta más tarde.',
                severity: 'error'
            });
            return;
        }

        // Reproducir sonido de mensaje enviado (si está habilitado)
        messageSentSound.current.volume = 0.2;
        messageSentSound.current.play().catch(e => console.log("Sound play prevented by browser."));

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

            // Verificar que la respuesta no contiene contenido inapropiado
            const sanitizedResponse = sanitizeResponse(response);

            // Add bot response
            const botMessage = {
                role: 'bot',
                content: sanitizedResponse,
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

    // Función para sanear respuestas, eliminar posible contenido inapropiado
    const sanitizeResponse = (response) => {
        // Patrones para detectar contenido potencialmente problemático
        const problematicPatterns = [
            { pattern: /(http|https):\/\/\S+/g, replacement: '[enlace eliminado por políticas de seguridad]' },
            { pattern: /\b(hackear|hackeo|exploit|vulnerable|vulnerabilidad)\b/gi, replacement: '[contenido filtrado]' }
        ];

        let sanitized = response;
        
        // Aplicar cada reemplazo
        problematicPatterns.forEach(({ pattern, replacement }) => {
            if (pattern.test(sanitized)) {
                sanitized = sanitized.replace(pattern, replacement);
                
                // Notificar moderación si se realizó algún reemplazo
                setInfoSnackbar({
                    open: true,
                    message: 'Algunos contenidos de la respuesta han sido filtrados por políticas de seguridad.',
                    severity: 'warning'
                });
            }
        });

        return sanitized;
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

    const handleCloseInfoSnackbar = () => {
        setInfoSnackbar({ ...infoSnackbar, open: false });
    };

    // Toggle usage info display
    const toggleUsageInfo = () => {
        setShowUsageInfo(!showUsageInfo);
    };

    // Report inappropriate content
    const reportContent = (messageIndex) => {
        // Implementación de report (ejemplo)
        const reportedMessage = messages[messageIndex];
        console.log("Mensaje reportado:", reportedMessage);
        
        // Aquí se implementaría la lógica para enviar el reporte al backend
        
        setInfoSnackbar({
            open: true,
            message: 'Gracias por tu reporte. Nuestro equipo revisará este contenido.',
            severity: 'success'
        });
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
                {requestsPending > 0 ? (
                    <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        badgeContent={
                            <CircularProgress 
                                size={16} 
                                thickness={5}
                                sx={{ color: 'white' }}
                            />
                        }
                    >
                        <SmartToy />
                    </Badge>
                ) : (
                    <SmartToy />
                )}
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
                    <Box>
                        <Tooltip title="Información de uso">
                            <IconButton 
                                onClick={toggleUsageInfo} 
                                sx={{ color: 'white', mr: 0.5 }}
                            >
                                <InfoOutlined fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* Panel informativo de uso y privacidad */}
                {showUsageInfo && (
                    <Paper sx={{ 
                        p: 2, 
                        m: 1, 
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        borderLeft: '3px solid #1976d2'
                    }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2' }}>
                            Información de Privacidad y Uso
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            • Este asistente utiliza Google Gemini para procesar tus consultas.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            • Tus mensajes son enviados al servidor y procesados para generar respuestas.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            • Límite de uso: máximo 20 mensajes por hora.
                        </Typography>
                        <Typography variant="body2">
                            • Las conversaciones no son almacenadas permanentemente pero pueden ser monitoreadas por motivos de seguridad.
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Link 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.open('/privacy-policy', '_blank');
                                }}
                                sx={{ color: '#90caf9', fontSize: '0.8rem' }}
                            >
                                Política de Privacidad
                            </Link>
                            <Link 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowUsageInfo(false);
                                }}
                                sx={{ color: '#90caf9', fontSize: '0.8rem' }}
                            >
                                Cerrar
                            </Link>
                        </Box>
                    </Paper>
                )}

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
                                        {message.isError ? <ErrorOutline fontSize="small" /> : <SmartToy fontSize="small" />}
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
                                        wordBreak: 'break-word',
                                        position: 'relative'
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
                                    
                                    {/* Opción para reportar contenido inapropiado */}
                                    {message.role === 'bot' && !message.isError && (
                                        <Tooltip title="Reportar contenido inapropiado">
                                            <IconButton
                                                size="small"
                                                onClick={() => reportContent(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    right: -5,
                                                    bottom: -5,
                                                    color: 'rgba(255, 255, 255, 0.5)',
                                                    '&:hover': {
                                                        color: 'rgba(255, 255, 255, 0.8)',
                                                    }
                                                }}
                                            >
                                                <Report fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 5, mb: 2 }}>
                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    El asistente está escribiendo...
                                </Typography>
                            </Box>
                        )}

                        {/* Advertencia de contenido (si existe) */}
                        {contentWarning && (
                            <Paper 
                                sx={{ 
                                    p: 1.5, 
                                    mb: 2, 
                                    bgcolor: 'rgba(255, 152, 0, 0.15)',
                                    borderLeft: '4px solid #ff9800',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Warning sx={{ mr: 1, color: '#ff9800' }} />
                                <Typography variant="body2" color="warning.light">
                                    {contentWarning}
                                </Typography>
                            </Paper>
                        )}

                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Indicador de uso */}
                    <Box sx={{ px: 2, py: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                Mensajes: {messageCounter}/20
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                Límite por hora
                            </Typography>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={(messageCounter / 20) * 100} 
                            sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: messageCounter > 15 ? '#f44336' : 
                                                    messageCounter > 10 ? '#ff9800' : '#4caf50'
                                }
                            }}
                        />
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
                            disabled={isTyping || messageCounter >= 20}
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
                            disabled={isTyping || newMessage.trim() === '' || messageCounter >= 20}
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

            {/* Info/warning snackbar */}
            <Snackbar
                open={infoSnackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseInfoSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseInfoSnackbar} severity={infoSnackbar.severity} variant="filled">
                    {infoSnackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default GeminiChatButton;