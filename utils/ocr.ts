import Tesseract from 'tesseract.js';

/**
 * OCR Utility (Real Tesseract Implementation)
 */

export interface OCRResult {
    firstName: string;
    lastName: string;
    confidence: number;
    rawText: string;
}

export async function scanIDCard(imageUri: string, providedFirstName: string, providedLastName: string): Promise<OCRResult> {
    console.log(`[OCR] Starting REAL scan for image: ${imageUri}`);

    try {
        const worker = await Tesseract.createWorker('eng');

        console.log(`[OCR] Worker created. Recognizing text...`);
        const { data: { text, confidence } } = await worker.recognize(imageUri);

        console.log(`[OCR] Raw Text Found: \n${text}`);
        console.log(`[OCR] Confidence: ${confidence}`);

        await worker.terminate();

        // Normalize for comparison
        const cleanText = text.toUpperCase();
        const cleanFirst = providedFirstName.toUpperCase().trim();
        const cleanLast = providedLastName.toUpperCase().trim();

        console.log(`[OCR DEBUG] Clean Text Length: ${cleanText.length}`);
        console.log(`[OCR DEBUG] Search First: "${cleanFirst}"`);
        console.log(`[OCR DEBUG] Search Last: "${cleanLast}"`);

        // Use Regex to find names as whole words, handling potential noise
        // This looks for the name even if there are weird symbols around it
        const firstRegex = new RegExp(`\\b${cleanFirst}\\b`, 'i');
        const lastRegex = new RegExp(`\\b${cleanLast}\\b`, 'i');

        const firstNameFound = firstRegex.test(cleanText) || cleanText.includes(cleanFirst);
        const lastNameFound = lastRegex.test(cleanText) || cleanText.includes(cleanLast);

        // We return the *provided* names if found, so the verification logic downstream passes.
        // If not found, we return "Not Found" to trigger failure.

        const result = {
            firstName: firstNameFound ? providedFirstName : "Not Found",
            lastName: lastNameFound ? providedLastName : "Not Found",
            confidence: confidence,
            rawText: text
        };

        console.log(`[OCR] Analysis Result:`, result);
        return result;

    } catch (error) {
        console.error(`[OCR] Error:`, error);
        return {
            firstName: "Error",
            lastName: "Error",
            confidence: 0,
            rawText: ""
        };
    }
}

export function compareNames(found: string, provided: string): boolean {
    return found.toLowerCase().trim() === provided.toLowerCase().trim();
}
