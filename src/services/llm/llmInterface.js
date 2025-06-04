/**
 * LLM Provider Interface
 * Defines the common methods that all LLM providers must implement
 */

/**
 * Base LLM Provider class that all providers should extend
 */
class LLMProvider {
  /**
   * Generate notes from transcript
   * @param {string} transcript - Video transcript text
   * @returns {Promise<string>} - Generated notes in markdown format
   */
  async generateNotes(transcript) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate mindmap structure from transcript
   * @param {string} transcript - Video transcript text
   * @returns {Promise<Object>} - Hierarchical mindmap structure
   */
  async generateMindmap(transcript) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate flashcards from transcript
   * @param {string} transcript - Video transcript text
   * @returns {Promise<Array>} - Array of flashcard objects
   */
  async generateFlashcards(transcript) {
    throw new Error('Method not implemented');
  }

  /**
   * Simple test method to check if the provider is working
   * @returns {Promise<boolean>} - True if provider is working
   */
  async test() {
    try {
      const result = await this.generateSample();
      return !!result;
    } catch (error) {
      console.error(`Provider test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate a simple response to test the provider
   * @returns {Promise<string>} - A simple response
   */
  async generateSample() {
    throw new Error('Method not implemented');
  }

  /**
   * Get provider information
   * @returns {Object} - Provider information
   */
  getInfo() {
    throw new Error('Method not implemented');
  }
}

module.exports = LLMProvider; 