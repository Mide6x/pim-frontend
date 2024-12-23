import { useState, useEffect } from 'react';
import { OpenAI } from 'openai';

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const useAutoPopulateDescription = (productName, manufacturerName) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDescription = async () => {
      if (productName && manufacturerName) {
        setLoading(true);
        setError(null);

        try {
          const prompt = `
            You are a product description assistant. Create a brief description of the following product based on the product name and manufacturer.

            Product Name: ${productName}
            Manufacturer: ${manufacturerName}

            Provide a description of approximately 50 words, focusing on the key features and benefits that would be important to potential buyers.
          `;

          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            temperature: 0.7,
          });

          const result = response.choices[0].message.content.trim();
          setDescription(result);
        } catch (err) {
          setError('Failed to fetch description.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDescription();
  }, [productName, manufacturerName]);

  return { description, loading, error };
};

export default useAutoPopulateDescription;
