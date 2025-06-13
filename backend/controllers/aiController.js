const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const handleChat = async (req, res) => {
    try {
        const { messages } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful study assistant. You help students with their studies, answer questions, and provide guidance on learning topics."
                },
                ...messages
            ],
            max_tokens: 500,
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

module.exports = {
    handleChat
}; 