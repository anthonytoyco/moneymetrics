import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY) {
  throw new Error("NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
);

export async function processFile(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    // Prepare the prompt
    const prompt = `Analyze this financial document and extract all transactions, 
      including titles, amounts, categories, dates, and descriptions.
      Format the response as a JSON array of transactions. Return ONLY the JSON array, no other text.
      Format:
        [
          {
            title: string,
            amount: double,
            category: string,
            date: string,
            description: string
          }
        ]
      Only include transactions that are clearly identifiable as a transaction.
      Titles:
        Should be the title of the transaction.
        It should be kept short and concise.
      Categories:
        Should be one of the following:
        'food', 'transport', 'utilities', 'entertainment', 'shopping', 'income', 'other'.
        Do not include any other categories.
        If the category is not clear, use 'other'.
      Amounts:
        Should be the amount of the transaction.
        If the amount is negative, it is an expense and the number should be negative.
        If the amount is positive, it is an income and the number should be positive.
      Dates:
        Should be the date that the transaction was made.
      Descriptions:
        Should be the description of the transaction.
        If no description is provided:
          If the title is clear, create a description based on the title.
          If the title is not clear, create a description based on the date and amount.
      `;

    // Create the image part
    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: file.type,
      },
    };

    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    try {
      // Remove any markdown code block markers if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      // Parse to validate JSON
      JSON.parse(cleanText);
      return cleanText;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Gemini response was not valid JSON");
    }
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error("Failed to process file with Gemini");
  }
}
