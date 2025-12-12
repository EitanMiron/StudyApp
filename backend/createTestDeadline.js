const mongoose = require('mongoose');
const Deadline = require('./models/deadlineModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studyapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const createTestDeadline = async () => {
    try {
        // Create a test deadline for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const testDeadline = new Deadline({
            title: 'Test Assignment',
            description: 'This is a test assignment to verify the upcoming deadlines feature',
            type: 'assignment',
            dueDate: tomorrow,
            user: '684c9b47c6972736de696720', // Your actual user ID
            priority: 'high',
            isCompleted: false
        });

        await testDeadline.save();
        console.log('Test deadline created successfully:', testDeadline);
        
        // Also create a deadline for next week
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const testDeadline2 = new Deadline({
            title: 'Test Quiz',
            description: 'This is a test quiz for next week',
            type: 'quiz',
            dueDate: nextWeek,
            user: '684c9b47c6972736de696720', // Your actual user ID
            priority: 'medium',
            isCompleted: false
        });

        await testDeadline2.save();
        console.log('Second test deadline created successfully:', testDeadline2);
        
        // Create an urgent deadline for today
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        const testDeadline3 = new Deadline({
            title: 'Urgent Project',
            description: 'This is an urgent project due today',
            type: 'project',
            dueDate: today,
            user: '684c9b47c6972736de696720', // Your actual user ID
            priority: 'high',
            isCompleted: false
        });

        await testDeadline3.save();
        console.log('Third test deadline created successfully:', testDeadline3);
        
    } catch (error) {
        console.error('Error creating test deadline:', error);
    } finally {
        mongoose.connection.close();
    }
};

createTestDeadline(); 