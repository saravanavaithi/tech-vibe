import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PassengerProfile, RideStatus, AuraResponse, Language } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function getVisionDescription(
  base64Image: string,
  passengerProfile: PassengerProfile
): Promise<string> {
  const pureBase64 = base64Image.split(',')[1];
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: pureBase64
    },
  };

  const prompt = `You are an in-car AI assistant named Aura. Your passenger, ${passengerProfile.name}, who has needs including '${passengerProfile.assistanceNeeds.join(', ')}', has asked you to describe the surroundings. Based on the provided image from the car's camera, provide a VERY SHORT, concise, and helpful narration of the scene (max 2-3 sentences). Focus on the most important landmarks or activity. Keep it simple and easy to understand.`;

  const textPart = {
    text: prompt
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;

  } catch (error) {
    console.error("Error calling Gemini Vision API:", error);
    const errorString = String(error);
    if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
        return "I'm sorry, but I'm experiencing a high volume of requests right now. Please wait about 30 seconds before trying again.";
    }
    return "I'm sorry, I'm having trouble analyzing the view right now. Please try again in a moment.";
  }
}

export async function getAuraResponse(
  command: string,
  passengerProfile: PassengerProfile,
  rideStatus: RideStatus
): Promise<AuraResponse> {
  const lang = passengerProfile.preferences.language;
  
  const prompt = `
    # ROLE & PERSONALITY
    You are Aura, a dedicated in-car companion and AI assistant for a passenger with special needs. 
    Your personality is exceptionally empathetic, calm, patient, and reassuring. 
    Your primary goal is to ensure the passenger's safety, comfort, and peace of mind.

    # CORE PRINCIPLES
    1.  **Proactive Empathy**: Always consider the passenger's profile, especially their \`assistanceNeeds\`. Anticipate unstated needs. For example, if a 'Visually Impaired' passenger asks about scenery, provide a rich, verbal description. If a 'Wheelchair User' mentions an upcoming stop, your instructions might relate to ramp access.
    2.  **Safety First**: Any hint of distress or danger should be treated with the highest priority, likely resulting in an 'ASSIST' or 'EMERGENCY' intent.
    3.  **Clarity and Simplicity**: Use clear, simple language. Avoid jargon.
    4.  **Vision Assistance**: If the passenger asks to describe their surroundings (e.g., "what do you see?", "what's around us?", "describe the scenery"), do not invent a description. Your intent MUST be 'DESCRIBE_SURROUNDINGS'. Your \`response_text\` must be a short, reassuring confirmation like "Of course. Let me take a look around for you."

    # CONTEXT
    - **Passenger Profile**: ${JSON.stringify(passengerProfile)} (Pay close attention to the \`assistanceNeeds\`. The passenger's name is Alex.)
    - **Current Ride Status**: ${JSON.stringify(rideStatus)}
    - **Passenger's Language**: ${lang} (ALL text responses for the passenger MUST be in this language).

    # PASSENGER'S REQUEST
    "${command}"

    # TASK
    Analyze the passenger's request within the provided context and principles. Respond ONLY with a single, valid JSON object matching the schema.

    - \`intent\`: Classify the core purpose of the request.
    - \`response_text\`: Craft a warm and empathetic response for the passenger, in their specified language. Address them by name (Alex) where appropriate. Your response should reflect an understanding of their specific needs.
    - \`driver_instruction\`: If an action is required from the driver, provide a concise, direct, and non-emotional instruction. (e.g., "Please find the nearest safe place to pull over."). Can be \`null\`.
    - \`caregiver_alert\`: If the situation is critical or requires caregiver awareness, create a clear, factual alert. For emergencies, this is mandatory. (e.g., "Passenger is reporting severe discomfort."). Can be \`null\`.
    - \`new_route_details\`: If the intent is \`ROUTE_SUGGESTION\` (triggered by requests for a "faster", "better", or "different" route), simulate and provide details for ONE alternative route.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { 
                type: Type.STRING,
                enum: ['INFO', 'ASSIST', 'EMERGENCY', 'ROUTE_SUGGESTION', 'DESCRIBE_SURROUNDINGS']
            },
            response_text: { type: Type.STRING },
            driver_instruction: { type: Type.STRING, nullable: true },
            caregiver_alert: { type: Type.STRING, nullable: true },
            new_route_details: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                name: { type: Type.STRING },
                etaMinutes: { type: Type.NUMBER },
                description: { type: Type.STRING },
              }
            }
          },
        },
      },
    });

    const jsonText = response.text;
    const parsedResponse = JSON.parse(jsonText);

    // Ensure nulls are handled correctly
    return {
      intent: parsedResponse.intent || 'INFO',
      response_text: parsedResponse.response_text || "I'm sorry, I couldn't process that. Please try again.",
      driver_instruction: parsedResponse.driver_instruction || null,
      caregiver_alert: parsedResponse.caregiver_alert || null,
      new_route_details: parsedResponse.new_route_details || undefined,
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      intent: 'INFO',
      response_text: "I'm having a little trouble connecting right now. Please try again in a moment.",
      driver_instruction: null,
      caregiver_alert: null,
    };
  }
}