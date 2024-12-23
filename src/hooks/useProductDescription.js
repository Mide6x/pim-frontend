import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const getProductDetailsFromOpenAI = async (productDetails) => {
  if (!productDetails || !productDetails.productName) {
    throw new Error('Invalid product details');
  }

  try {
    const prompt = `
      You are a product description assistant. Create a brief description of the following product based on all provided details.

      Product Name: ${productDetails.productName}
      Manufacturer: ${productDetails.manufacturerName}
      Brand: ${productDetails.brand}
      Category: ${productDetails.productCategory}
      Subcategory: ${productDetails.productSubcategory}
      Variant: ${productDetails.variant}
      Type: ${productDetails.variantType}
      Weight: ${productDetails.weight}kg

      Provide a professional and engaging description of approximately 80 words, focusing on the key features, benefits, and unique selling points that would be important to potential buyers.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional product description writer. Write clear, concise, and engaging product descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    return response.choices[0].message.content.trim();

  } catch (error) {
    console.error('Error generating description:', error);
    throw new Error('Failed to generate description');
  }
}; 