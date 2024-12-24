import { useState } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const useNotificationSummary = () => {
  const [isSummaryView, setIsSummaryView] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSummary = async (notifications) => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      setSummary('No notifications to summarize');
      return;
    }

    try {
      setLoading(true);
      const last24Hours = notifications.filter(notification => {
        const notificationDate = new Date(notification.createdAt);
        const now = new Date();
        const diffHours = (now - notificationDate) / (1000 * 60 * 60);
        return diffHours <= 24;
      });

      if (last24Hours.length === 0) {
        setSummary("No activities in the last 24 hours");
        return;
      }

      const prompt = `Summarize these notifications by user email and action type:
        ${JSON.stringify(last24Hours)}
        Format: "user@email.com: performed X actions, Y edits, etc."`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      setSummary(response.choices[0].message.content);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const toggleSummaryView = async (notifications) => {
    if (!isSummaryView && Array.isArray(notifications)) {
      await generateSummary(notifications);
    }
    setIsSummaryView(!isSummaryView);
  };

  return { isSummaryView, summary, loading, toggleSummaryView };
}; 