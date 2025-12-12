const Deadline = require('../models/deadlineModel');

const createDeadline = async (data) => {
    const deadline = new Deadline(data);
    await deadline.save();
    return deadline;
};

const updateDeadline = async (id, updates) => {
    const deadline = await Deadline.findByIdAndUpdate(id, updates, { new: true });
    return deadline;
};

const deleteDeadline = async (id) => {
    await Deadline.findByIdAndDelete(id);
};

const getUpcomingDeadlines = async (userId, limit = 5) => {
    return Deadline.find({
        user: userId,
        dueDate: { $gte: new Date() },
        isCompleted: false
    })
    .sort('dueDate')
    .limit(limit);
};

const syncQuizDeadlines = async (quiz) => {
    if (quiz.dueDate) {
        await Deadline.updateOne(
            { relatedItem: quiz._id, relatedItemModel: 'Quiz' },
            {
                title: quiz.title,
                dueDate: quiz.dueDate,
                type: 'quiz',
                group: quiz.group,
                course: quiz.course
            },
            { upsert: true }
        );
    }
};

module.exports = {
    createDeadline,
    updateDeadline,
    deleteDeadline,
    getUpcomingDeadlines,
    syncQuizDeadlines
};
