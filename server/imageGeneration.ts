import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import { updateEvent } from "./db";

/**
 * Generate and store images for significant historical events
 */
export async function generateEventImage(
  eventId: number,
  eventTitle: string,
  eventDescription: string,
  eventType: string,
  importance: number,
  imagePrompt: string | null | undefined,
  speciesNames: string[],
  speciesColors: string[]
): Promise<{ url: string; success: boolean }> {
  try {
    // Only generate images for important events (importance >= 6)
    if (importance < 6) {
      return { url: "", success: false };
    }

    // Use event description as fallback if no prompt provided
    const basePrompt = imagePrompt || eventDescription;

    // Enhance the prompt with species-specific aesthetic guidance
    const enhancedPrompt = buildEnhancedPrompt(
      basePrompt,
      eventType,
      speciesNames,
      speciesColors
    );

    console.log(`[Image Generation] Generating image for event ${eventId}: ${eventTitle}`);

    // Generate image
    const imageResult = await generateImage({
      prompt: enhancedPrompt,
    });

    if (!imageResult.url) {
      throw new Error("Image generation returned no URL");
    }

    // Upload to S3
    const imageBuffer = await fetch(imageResult.url).then((res) => res.arrayBuffer());
    const fileKey = `events/${eventId}-${Date.now()}.png`;

    const storageResult = await storagePut(
      fileKey,
      Buffer.from(imageBuffer),
      "image/png"
    );

    // Update event with image URL
    await updateEvent(eventId, {
      imageUrl: storageResult.url,
      imagePrompt: enhancedPrompt,
      generatedImageAt: new Date(),
    });

    console.log(`[Image Generation] Successfully generated image for event ${eventId}`);
    return { url: storageResult.url, success: true };
  } catch (error) {
    console.error(`[Image Generation] Error generating image for event ${eventId}:`, error);
    return { url: "", success: false };
  }
}

/**
 * Build enhanced prompt with species-specific aesthetics
 */
function buildEnhancedPrompt(
  basePrompt: string,
  eventType: string,
  speciesNames: string[],
  speciesColors: string[]
): string {
  const styleGuide = getStyleGuideForSpecies(speciesNames);
  const eventContext = getEventContext(eventType);

  return `${basePrompt}

Artistic Style: ${styleGuide}
Event Context: ${eventContext}
Species Involved: ${speciesNames.join(", ")}
Color Palette: ${speciesColors.join(", ")}

Render in a hand-drawn, sketch-like aesthetic with rich detail and dramatic lighting. 
Show the scale and impact of this historical moment. Include architectural or technological elements 
appropriate to the species and era. Make it feel like an illustration from an ancient chronicle or history book.`;
}

/**
 * Get art style guide based on species involved
 */
function getStyleGuideForSpecies(speciesNames: string[]): string {
  const styleMap: Record<string, string> = {
    Humans:
      "Realistic human figures with expressive faces, architectural details, and dynamic composition. Renaissance-inspired perspective.",
    Xylothians:
      "Geometric, crystalline forms with insectoid anatomy. Symmetrical compositions with fractal patterns and bioluminescent elements.",
    Aquarians:
      "Fluid, organic shapes with flowing water elements. Bioluminescent colors and ethereal, dreamlike atmosphere.",
    Silicates:
      "Geometric, mineral-like forms with sharp angles. Crystalline structures and geological formations. Monochromatic with metallic accents.",
    Ethereals:
      "Abstract, energy-based forms with flowing plasma and electromagnetic fields. Ethereal, otherworldly atmosphere with cosmic elements.",
    Reptilians:
      "Powerful, predatory forms with scaled textures. Dynamic action poses and territorial/hierarchical compositions.",
    Avians:
      "Graceful, winged figures in flight. Sky-oriented compositions with wind and aerial perspective. Feathered textures.",
    Myconids:
      "Organic, fungal forms with spore clouds and bioluminescence. Interconnected network patterns. Ancient, primordial atmosphere.",
  };

  // Combine styles for multiple species
  const styles = speciesNames
    .map((name) => styleMap[name] || "Sci-fi illustration style")
    .join(" + ");

  return styles || "Sci-fi illustration with hand-drawn aesthetic";
}

/**
 * Get context based on event type
 */
function getEventContext(eventType: string): string {
  const contextMap: Record<string, string> = {
    "species-origin": "A new species emerges from primordial conditions, first consciousness awakening.",
    "first-tool": "Ancient beings discover and craft their first tools, a pivotal moment of intelligence.",
    "first-fire": "Discovery of fire - a transformative moment with warmth and light spreading through darkness.",
    "first-settlement":
      "The first permanent settlements being established, marking the transition from nomadic to settled life.",
    "agriculture-discovery": "Discovery of agriculture, showing crops growing and civilization beginning.",
    "first-city":
      "A grand city rising from the landscape, architectural wonder and urban civilization emerging.",
    "empire-rise": "An empire at its height, showing power, organization, and territorial dominance.",
    "war-declared": "A dramatic battle scene with conflict, tension, and the clash of civilizations.",
    "first-contact": "Two alien species meeting for the first time, a moment of wonder and uncertainty.",
    "technology-breakthrough": "A revolutionary technology being demonstrated or discovered.",
    "industrial-revolution": "Factories, machines, and industry transforming the landscape.",
    "first-spaceflight": "A spacecraft launching into space, breaking free from planetary bonds.",
    "extinction": "A tragic moment of species decline, showing the end of an era.",
    "alliance-formed": "Two or more species/civilizations coming together in unity.",
    "cultural-renaissance": "Artistic and cultural flourishing, showing creativity and beauty.",
  };

  return contextMap[eventType] || "A significant historical moment in galactic civilization.";
}

/**
 * Batch generate images for multiple events
 */
export async function generateEventImagesBatch(
  events: Array<{
    id: number;
    title: string;
    description: string;
    eventType: string;
    importance: number;
    imagePrompt: string | null | undefined;
    speciesIds: number[];
    speciesNames: string[];
    speciesColors: string[];
  }>
) {
  const results = [];

  // Generate images for high-importance events only
  const importantEvents = events.filter((e) => e.importance >= 6);

  console.log(
    `[Image Generation] Batch generating images for ${importantEvents.length} important events`
  );

  for (const event of importantEvents) {
    const result = await generateEventImage(
      event.id,
      event.title,
      event.description,
      event.eventType,
      event.importance,
      event.imagePrompt,
      event.speciesNames,
      event.speciesColors
    );

    results.push({
      eventId: event.id,
      success: result.success,
      url: result.url,
    });

    // Add delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
