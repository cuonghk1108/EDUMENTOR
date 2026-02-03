const aiService = require('../services/aiService');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure audio directory exists
const audioDir = path.join(__dirname, '../audio');
fs.mkdir(audioDir, { recursive: true }).catch(() => {});

/**
 * Generate audio from text (Text-to-Speech)
 */
exports.generateAudio = async (req, res) => {
  try {
    const { text, voice, speed } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    // Limit text length
    if (text.length > 4096) {
      return res.status(400).json({ 
        error: 'Nội dung quá dài. Tối đa 4096 ký tự.' 
      });
    }

    // Generate audio using OpenAI TTS
    const result = await aiService.generateSpeech(text, {
      voice: voice || 'nova',
      speed: parseFloat(speed) || 1.0
    });

    // Save audio file
    const audioId = uuidv4();
    const filename = `${audioId}.mp3`;
    const filePath = path.join(audioDir, filename);
    
    await fs.writeFile(filePath, result.audioBuffer);

    res.json({
      success: true,
      audio: {
        id: audioId,
        url: `/audio/${filename}`,
        format: result.format
      }
    });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get audio file
 */
exports.getAudio = async (req, res) => {
  try {
    const { audioId } = req.params;
    const filePath = path.join(audioDir, `${audioId}.mp3`);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'Không tìm thấy file audio' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Get audio error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Stream audio generation
 */
exports.streamAudio = async (req, res) => {
  try {
    const { text, voice, speed } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung' });
    }

    const result = await aiService.generateSpeech(text, {
      voice: voice || 'nova',
      speed: parseFloat(speed) || 1.0
    });

    // Set headers for audio streaming
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': result.audioBuffer.length,
      'Content-Disposition': 'inline; filename="speech.mp3"'
    });

    res.send(result.audioBuffer);
  } catch (error) {
    console.error('Stream audio error:', error);
    res.status(500).json({ error: error.message });
  }
};
