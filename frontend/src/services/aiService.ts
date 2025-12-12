import axios from 'axios';

const API_BASE_URL = '/api';

export interface AIChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AIChatRequest {
    messages: AIChatMessage[];
    noteId?: string;
    context?: {
        notes: Array<{
            term: string;
            definition: string;
        }>;
    };
}

export interface GeneratedNote {
    term: string;
    definition: string;
    keyPoints: string[];
    examples: string[];
    relatedConcepts: string[];
}

export interface GeneratedFlashcard {
    question: string;
    answer: string;
}

export interface ConceptExplanation {
    explanation: string;
    keyPoints: string[];
    examples: string[];
    analogies: string[];
    applications: string[];
}

class AIService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async chat(request: AIChatRequest): Promise<{ message: string }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/ai/chat`,
                request,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('AI Chat error:', error);
            throw error;
        }
    }

    async generateNote(topic: string, subject?: string, complexity?: string): Promise<GeneratedNote> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/ai/generate-note`,
                { topic, subject, complexity },
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Generate Note error:', error);
            throw error;
        }
    }

    async generateFlashcards(noteId: string, count: number = 5): Promise<{ flashcards: GeneratedFlashcard[] }> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/ai/generate-flashcards`,
                { noteId, count },
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Generate Flashcards error:', error);
            throw error;
        }
    }

    async explainConcept(concept: string, context?: string, level?: string): Promise<ConceptExplanation> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/ai/explain-concept`,
                { concept, context, level },
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Explain Concept error:', error);
            throw error;
        }
    }
}

export default new AIService(); 
