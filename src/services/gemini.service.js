import api from './axios'; 

class GeminiService {
    constructor() {
        this.requestQueue = [];
        this.requestsInLastMinute = 0;
        this.lastRateLimitReset = Date.now();
        this.userRateLimit = 10; // Máximo de mensajes por minuto para un usuario
        this.consecutiveErrors = 0;
        this.backoffTime = 1000; // Tiempo inicial de retroceso exponencial (1 segundo)
        
        // Content moderation patterns
        this.moderationPatterns = [
            { pattern: /\b(hack|steal|exploit|cheat|script)\b.*\b(game|account|system)\b/i, reason: 'potential_cheating' },
            { pattern: /\b(password|credit card|address|personal|private)\b/i, reason: 'personal_info' },
            { pattern: /\b(kill|hurt|harm|attack)\b.*\b(person|people|individual|user)\b/i, reason: 'harmful_content' }
        ];
    }

    /**
     * Verifica si un mensaje cumple con las políticas de uso
     * @param {string} message - El mensaje a verificar
     * @returns {Object} Resultado de la verificación {valid: boolean, reason: string}
     */
    validateMessage(message) {
        // Validación básica
        if (!message || typeof message !== 'string') {
            return { valid: false, reason: 'El mensaje no puede estar vacío' };
        }

        if (message.length > 1000) {
            return { valid: false, reason: 'El mensaje excede el límite de 1000 caracteres' };
        }

        if (message.trim().length === 0) {
            return { valid: false, reason: 'El mensaje no puede estar vacío' };
        }

        // Moderación de contenido
        for (const pattern of this.moderationPatterns) {
            if (pattern.pattern.test(message)) {
                return { 
                    valid: false, 
                    reason: 'Tu mensaje puede contener contenido inapropiado relacionado con ' + 
                            pattern.reason.replace('_', ' ') 
                };
            }
        }

        return { valid: true };
    }

    /**
     * Gestiona el límite de velocidad de las solicitudes
     * @returns {Object} Estado del límite de velocidad {limited: boolean, wait: number}
     */
    checkRateLimit() {
        const now = Date.now();
        const oneMinute = 60 * 1000;

        // Reiniciar contador si ha pasado más de un minuto
        if (now - this.lastRateLimitReset > oneMinute) {
            this.requestsInLastMinute = 0;
            this.lastRateLimitReset = now;
        }

        // Verificar si excede el límite
        if (this.requestsInLastMinute >= this.userRateLimit) {
            const waitTime = oneMinute - (now - this.lastRateLimitReset);
            return { limited: true, wait: Math.ceil(waitTime / 1000) };
        }

        // Incrementar contador
        this.requestsInLastMinute++;
        return { limited: false };
    }

    /**
     * Envía una pregunta al chatbot Gemini a través del backend
     * @param {string} prompt - La pregunta o mensaje del usuario
     * @param {Array} conversation - Historial de la conversación
     * @returns {Promise<Object>} - Respuesta del chatbot
     */
    async sendMessage(prompt, conversation = []) {
        // Validar el mensaje
        const validation = this.validateMessage(prompt);
        if (!validation.valid) {
            return Promise.reject(new Error(validation.reason));
        }

        // Verificar límite de velocidad
        const rateLimit = this.checkRateLimit();
        if (rateLimit.limited) {
            return Promise.reject(new Error(
                `Has excedido el límite de mensajes. Por favor, espera ${rateLimit.wait} segundos antes de enviar otra consulta.`
            ));
        }

        try {
            // Aplicar retroceso exponencial si ha habido errores consecutivos
            if (this.consecutiveErrors > 0) {
                const delay = Math.min(this.backoffTime * Math.pow(2, this.consecutiveErrors - 1), 30000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            // Usar la instancia de axios configurada
            const response = await api.post('/gemini/chat', {
                prompt,
                conversation
            }, {
                timeout: 20000 // 20 segundos de timeout
            });

            // Reiniciar el contador de errores consecutivos
            this.consecutiveErrors = 0;
            
            return response.data;
        } catch (error) {
            // Incrementar el contador de errores consecutivos
            this.consecutiveErrors++;
            
            console.error('Error en Gemini Service:', error);

            // Formatear un mensaje de error legible según el tipo de error
            let errorMessage = 'Error al comunicarse con el asistente.';

            if (error.response) {
                // La solicitud llegó al servidor y respondió con un código de error
                if (error.response.status === 429) {
                    errorMessage = 'Has excedido el límite de mensajes. Por favor, espera unos minutos.';
                } else if (error.response.status === 401 || error.response.status === 403) {
                    errorMessage = 'No tienes autorización para usar esta función. Por favor, inicia sesión nuevamente.';
                } else if (error.response.status === 400) {
                    errorMessage = error.response.data?.message || 'La solicitud es inválida. Por favor reformula tu mensaje.';
                } else {
                    errorMessage = error.response.data?.message || 'Error en el servidor.';
                }
            } else if (error.request) {
                // La solicitud se hizo pero no se recibió respuesta
                errorMessage = 'No se pudo contactar con el servidor. Verifica tu conexión a internet.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'La solicitud ha tardado demasiado. Intenta con una consulta más breve.';
            }

            // Guardar este error para análisis (opcional)
            this.logError(prompt, errorMessage);

            throw new Error(errorMessage);
        }
    }

    /**
     * Loga errores para análisis posterior (implementación básica)
     * @param {string} prompt - El mensaje que causó el error
     * @param {string} errorMessage - El mensaje de error
     */
    logError(prompt, errorMessage) {
        try {
            const errorLog = {
                timestamp: new Date().toISOString(),
                prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
                error: errorMessage
            };
            
            // Guardar en localStorage para posibles diagnósticos
            const logs = JSON.parse(localStorage.getItem('geminiErrorLogs') || '[]');
            logs.push(errorLog);
            // Mantener solo los últimos 10 errores
            if (logs.length > 10) logs.shift();
            localStorage.setItem('geminiErrorLogs', JSON.stringify(logs));
            
            // Aquí podrías enviar los errores a un servicio de telemetría
            // si implementas uno en el futuro
        } catch (e) {
            console.error('Error logging failed:', e);
        }
    }
}

// Exportar una instancia única del servicio
export default new GeminiService();