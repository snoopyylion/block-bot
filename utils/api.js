export const fetchAIResponse = async (question) => {
    try {
        const response = await fetch("https://blockboys-chatbot-fastapi-backend.onrender.com/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question }),
        });

        console.log("Raw API Response:", response); // Debugging

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Parsed Response Data:", data); // Debugging

        return data;
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return { error: error.message };
    }
};
