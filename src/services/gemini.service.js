import api from './axios';

class GeminiService {
    /**
     * Envía una pregunta al chatbot Gemini a través del backend
     * @param {string} prompt - La pregunta o mensaje del usuario
     * @param {Array} conversation - Historial de la conversación
     * @returns {Promise<Object>} - Respuesta del chatbot
     */
    async sendMessage(prompt, conversation = []) {
        try {
            // Usamos la instancia de axios configurada que ya tienes en ./axios
            // que debería manejar la ruta base correcta y añadir los tokens de autenticación
            const response = await api.post('/gemini/chat', {
                prompt,
                conversation
            });

            return response.data;
        } catch (error) {
            console.error('Error en Gemini Service:', error);

            // Formatear un mensaje de error legible según el tipo de error
            let errorMessage = 'Error al comunicarse con el asistente.';

            if (error.response) {
                // El servidor respondió con un código de error
                if (error.response.status === 429) {
                    errorMessage = 'Has excedido el límite de mensajes. Por favor, espera unos minutos.';
                } else if (error.response.status === 401 || error.response.status === 403) {
                    errorMessage = 'No tienes autorización para usar esta función. Por favor, inicia sesión nuevamente.';
                } else {
                    errorMessage = error.response.data?.message || 'Error en el servidor.';
                }
            } else if (error.request) {
                // La solicitud se hizo pero no se recibió respuesta
                errorMessage = 'No se pudo contactar con el servidor. Verifica tu conexión a internet.';
            }

            throw new Error(errorMessage);
        }
    }
}

// Exportar una instancia única del servicio
export default new GeminiService();