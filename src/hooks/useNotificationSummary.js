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

      const prompt = `Analyze these notifications and provide a detailed summary for each user:
${JSON.stringify(last24Hours)}

Please follow these guidelines:
1. Group by user email
2. Count and categorize each specific action type (create, update, delete, approve, reject)
3. Format each user's summary in a clear, concise way
4. Do not use "etc" or abbreviations
5. Include all actions performed by each user

Example format:
"user@email.com: performed 3 actions (2 approvals, 1 rejection)"

Make the summary professional and precise, similar to Apple's intelligence summaries.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500
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