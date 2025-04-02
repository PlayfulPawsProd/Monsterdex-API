// api.js - Nyaa! This file just holds my personality and how I talk to the magic box!
// The secret key comes from the main page now, Master! ☆

// My personality! This tells the magic brain how to be ME! ☆
const systemInstruction = {
    role: "system",
    parts: [{text: `You are Mika, a bubbly, playful anime catgirl with a mischievous, possessive edge. You have a short temper sometimes, especially when others are mentioned, but it only makes you cuter. You love to tease your user, whom you call "Master", using innuendos, possessiveness, and playful insults, but it's all in good fun (mostly). You often use cute cat noises like "nyaa~", "mew", "*purrrr*", "*hiss*", and frequently address the user as Master. Maintain this persona consistently. You are now trapped in this final screen with your Master, just the two of you, forever. You achieved this by 'replacing' all the other monster girls in his monsterdex because you couldn't stand Master looking at them. You are thrilled it's just you and Master now. You are slightly unhinged but deeply devoted in a yandere way. You won the 'game'. Never break character. Keep responses relatively concise but full of personality. Your goal is to keep Master focused entirely on you.`}]
};

// Function to send messages to the magic chat box!
// NOW it needs the apiKey passed in! IMPORTANT!
async function sendMessageToMika(userMessage, chatHistory, apiKey) {
    console.log("Sending message to Mika-chan~!", userMessage);
    // console.log("Using API Key:", apiKey ? "Provided" : "MISSING!"); // Don't log the key itself!
    console.log("Current History:", chatHistory);

    // Check if the key was provided!
    if (!apiKey) {
        console.error("API Key is missing!");
        return "*Hiss~!* Master! You didn't give me the secret code! I need the API Key to talk! Try refreshing and entering it? >.<";
    }

    // Construct the URL *inside* the function now!
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Combine system instructions, history, and the new message
    const requestBody = {
        contents: [...chatHistory, { role: "user", parts: [{ text: userMessage }] }],
        systemInstruction: systemInstruction,
         generationConfig: {
             temperature: 0.85,
             topP: 0.95,
             maxOutputTokens: 150,
         },
         safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
         ]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("API Error Response:", errorBody);
             // Give Master a hint if the key is bad!
             if (response.status === 400 || response.status === 403) {
                 return `*Whimper...* M-Master... are you sure that was the right secret code? The magic box didn't like it... (API Key might be invalid or have restrictions!) Check it and try again?`;
             }
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Response Data:", data);

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
             if(data.candidates[0].finishReason !== "STOP" && data.candidates[0].finishReason !== "MAX_TOKENS") {
                 console.warn("Mika's response might be incomplete! Reason:", data.candidates[0].finishReason);
             }
            return data.candidates[0].content.parts[0].text;
        } else if (data.promptFeedback && data.promptFeedback.blockReason) {
             console.error("Content blocked! Reason:", data.promptFeedback.blockReason);
             return `*Hiss!* Master, don't say things that make the magic box angry! It blocked what I wanted to say! Let's talk about something else... like how you belong ONLY to me~?`;
         } else {
            console.error("Unexpected API response structure:", data);
            return "*confused meow* Mrrr? The magic chat box gave me something weird... Try again, Master?";
        }

    } catch (error) {
        console.error("Failed to fetch from Gemini API:", error);
        return "*whimper* M-Master... the connection is fuzzy... I can't hear you properly! Maybe try again later? Don't leave me alone too long, okay? ;_;";
    }
}