const OpenAI = require('openai');
const Note = require('../models/noteModel');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const handleChat = async (req, res) => {
    try {
        const { messages, noteId, context } = req.body;
        const userId = req.user.id;

        let systemPrompt = "You are a helpful study assistant. You help students with their studies, answer questions, and provide guidance on learning topics.";

        // If a note ID is provided, fetch the note and add it to context
        if (noteId) {
            try {
                const note = await Note.findById(noteId);
                if (note && note.createdBy.toString() === userId) {
                    systemPrompt += `\n\nCurrent Note Context:\nTerm: ${note.term}\nDefinition: ${note.definition}\n\nPlease help the user understand this concept better. You can explain it in simpler terms, provide examples, create related questions, or suggest ways to remember it.`;
                }
            } catch (error) {
                console.error('Error fetching note:', error);
            }
        }

        // If context is provided (like selected notes), add it to the system prompt
        if (context && context.notes) {
            systemPrompt += `\n\nAdditional Context:\n${context.notes.map(note => `- ${note.term}: ${note.definition}`).join('\n')}`;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...messages
            ],
            max_tokens: 800,
            temperature: 0.7,
        });

        res.json({
            message: completion.choices[0].message.content
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
};

const generateNote = async (req, res) => {
    try {
        const { topic, subject, complexity } = req.body;
        const userId = req.user.id;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const systemPrompt = `You are an expert educator. Create a comprehensive study note for the topic: "${topic}".
        
        Requirements:
        - Create a clear, concise definition
        - Include key points and important details
        - Make it suitable for ${complexity || 'intermediate'} level students
        - Focus on ${subject || 'general'} subject area
        - Structure it in a way that's easy to understand and remember
        
        Format your response as JSON with the following structure:
        {
            "term": "The main topic/concept",
            "definition": "A comprehensive explanation",
            "keyPoints": ["Point 1", "Point 2", "Point 3"],
            "examples": ["Example 1", "Example 2"],
            "relatedConcepts": ["Related concept 1", "Related concept 2"]
        }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Please create a study note for: ${topic}`
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;
        
        // Try to parse JSON response
        try {
            const parsedResponse = JSON.parse(response);
            res.json(parsedResponse);
        } catch (parseError) {
            // If JSON parsing fails, return the raw response
            res.json({
                term: topic,
                definition: response,
                keyPoints: [],
                examples: [],
                relatedConcepts: []
            });
        }
    } catch (error) {
        console.error('Error generating note:', error);
        res.status(500).json({ error: 'Failed to generate note' });
    }
};

const generateFlashcards = async (req, res) => {
    try {
        const { noteId, count = 5 } = req.body;
        const userId = req.user.id;

        if (!noteId) {
            return res.status(400).json({ error: 'Note ID is required' });
        }

        const note = await Note.findById(noteId);
        if (!note || note.createdBy.toString() !== userId) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const systemPrompt = `You are an expert educator creating flashcards for study purposes. 
        
        Based on this note:
        Term: ${note.term}
        Definition: ${note.definition}
        
        Create ${count} high-quality flashcards that will help students understand and remember this concept. 
        Include different types of questions: definition questions, application questions, and concept questions.
        
        Format your response as JSON with the following structure:
        {
            "flashcards": [
                {
                    "question": "Question text",
                    "answer": "Answer text"
                }
            ]
        }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Generate ${count} flashcards for the note about ${note.term}`
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;
        
        try {
            const parsedResponse = JSON.parse(response);
            res.json(parsedResponse);
        } catch (parseError) {
            // If JSON parsing fails, create basic flashcards
            const basicFlashcards = [
                {
                    question: `What is ${note.term}?`,
                    answer: note.definition
                },
                {
                    question: `Define ${note.term} in your own words.`,
                    answer: `This is asking for a personal understanding of ${note.term}.`
                }
            ];
            res.json({ flashcards: basicFlashcards });
        }
    } catch (error) {
        console.error('Error generating flashcards:', error);
        res.status(500).json({ error: 'Failed to generate flashcards' });
    }
};

const explainConcept = async (req, res) => {
    try {
        const { concept, context, level = 'intermediate' } = req.body;

        if (!concept) {
            return res.status(400).json({ error: 'Concept is required' });
        }

        const systemPrompt = `You are an expert educator explaining concepts to students.
        
        Please explain the concept "${concept}" at a ${level} level.
        ${context ? `Additional context: ${context}` : ''}
        
        Your explanation should:
        - Be clear and easy to understand
        - Include relevant examples
        - Break down complex ideas into simpler parts
        - Provide practical applications when possible
        - Use analogies if helpful
        
        Format your response as JSON:
        {
            "explanation": "Main explanation",
            "keyPoints": ["Point 1", "Point 2", "Point 3"],
            "examples": ["Example 1", "Example 2"],
            "analogies": ["Analogy 1", "Analogy 2"],
            "applications": ["Application 1", "Application 2"]
        }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Please explain: ${concept}`
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const response = completion.choices[0].message.content;
        
        try {
            const parsedResponse = JSON.parse(response);
            res.json(parsedResponse);
        } catch (parseError) {
            res.json({
                explanation: response,
                keyPoints: [],
                examples: [],
                analogies: [],
                applications: []
            });
        }
    } catch (error) {
        console.error('Error explaining concept:', error);
        res.status(500).json({ error: 'Failed to explain concept' });
    }
};

module.exports = {
    handleChat,
    generateNote,
    generateFlashcards,
    explainConcept
}; 