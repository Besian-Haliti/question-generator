export async function POST(req) {
    try {
        // Parse the incoming request body
        const body = await req.json();
        const {
            OriginalQuestion,
            MarkScheme,
            ExaminerReport,
            ContextArea,
            NumberOfVariations,
            Images // Extract the array of images
        } = body;

        console.log("Incoming request:", JSON.stringify(body, null, 2));

        // If images are present, log the number of images
        if (Images && Images.length > 0) {
            console.log(`Received ${Images.length} images.`);
        }

        // Construct the prompt for the AI
        const systemprompt = `You are an AI generating questions for OCR Economics A Level papers. 
        You will receive context and detailed inputs including mark schemes, examiner reports, and relevant images. Generate a JSON response for each variation of the question, strictly adhering to the provided structure. 
        Here is the format for all your responses even if not enough data is given:
        [
        {
            "GroupID": "",
            "Topic": "",
            "QuestionType": "MCQ/SAQ/Calculation/Diagram",
            "Theme": 1-4,
            "Marks": 0-4,
            "Context": "",
            "Question": "",
            "Options": [],
            "Answer": "",
            "ImageID": "",
            "Knowledge": 0-4,
            "Application": 0-4,
            "Analysis": 0-4,
            "Evaluation": 0-4,
            "WorkingOut": "",
            "Criteria": "",
            "K": 0-4,
            "A": 0-4,
            "A2": 0-4,
            "EV": 0-4,
            "ParentGroupID": "",
            "PartNumber": (depending on the number of parts of the question)
        }
        ]
        Ensure the sum of K, A, A2, and EV does not exceed 4.
        Always respond as JSON array and even if no context is given ensure you always
        return a JSON array.`;

        const prompt = `Here is the context:
            Context Area: ${ContextArea}
            Number of Variations: ${NumberOfVariations}
            Original Question: ${OriginalQuestion}
            Mark Scheme: ${MarkScheme}
            Examiner Report: ${ExaminerReport}
            Images: ${Images.length > 0 ? "Attached images are provided." : "No images provided."}

            Please generate ${NumberOfVariations} variations of the original question. Each variation should:
            1. Adhere to the OCR Economics A Level syllabus.
            2. Include a question type, context, and other attributes as specified in the JSON structure.
            3. Provide detailed mark schemes and criteria descriptions.
            4. Incorporate images into ImageID if provided.
            5. Use effective MR (Marking Requirements) and ER (Examiner Report insights).
            Always respond as JSON array and even if no context is given ensure you always
            return a JSON array.`;

        // Make a POST request to the OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: systemprompt },
                    { role: "user", content: prompt },
                ],
                max_tokens: 3000,
            }),
        });

        // Handle the AI response
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error details from OpenAI:", errorData);
            throw new Error(
                `OpenAI returned an error: ${errorData.message || "Unknown error"}`
            );
        }

        const responseData = await response.json();
        console.log("AI response:", responseData.choices[0].message.content.trim());

        // Return the response from OpenAI to the client
        return new Response(
            JSON.stringify({ response: responseData.choices[0].message.content.trim() }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error in POST handler:", error);
        return new Response(
            JSON.stringify({
                error: "Failed to process the request",
                details: error.message,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
