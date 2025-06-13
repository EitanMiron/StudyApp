import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    IconButton, 
    Paper, 
    Typography,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIAssistantProps {
    initialQuestion?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ initialQuestion }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState(initialQuestion || '');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:4000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message
            }]);
        } catch (error) {
            console.error('Error:', error);
            // Handle error appropriately
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ 
            width: '100%', 
            maxWidth: 800, 
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 2, 
                    mb: 2,
                    flexGrow: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                            mb: 1
                        }}
                    >
                        <Paper
                            elevation={1}
                            sx={{
                                p: 2,
                                maxWidth: '70%',
                                backgroundColor: message.role === 'user' ? '#2A7B9B' : '#f5f5f5',
                                color: message.role === 'user' ? 'white' : 'inherit'
                            }}
                        >
                            <Typography variant="body1">
                                {message.content}
                            </Typography>
                        </Paper>
                    </Box>
                ))}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
            </Paper>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={loading}
                />
                <IconButton 
                    color="primary" 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

export default AIAssistant; 