import { Request, Response } from 'express';
import { parseCSV, parseJSON } from '../utils/helpers';
import { saveUpload } from '../services/database';

export const uploadFile = async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log('📤 Upload request received:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        bufferLength: req.file.buffer?.length
      } : 'No file',
      body: req.body
    });

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded. Please select a CSV or JSON file.' });
    }

    const { country = 'UAE', erp = 'Unknown' } = req.body;
    console.log('📝 Processing upload:', { country, erp });

    let data: any[];
    const fileBuffer = req.file.buffer.toString('utf-8');
    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();

    console.log('📄 File details:', {
      extension: fileExtension,
      size: fileBuffer.length,
      first100Chars: fileBuffer.substring(0, 100)
    });

    if (fileExtension === 'csv') {
      console.log('🔧 Parsing CSV file...');
      data = parseCSV(fileBuffer);
    } else if (fileExtension === 'json') {
      console.log('🔧 Parsing JSON file...');
      data = parseJSON(fileBuffer);
    } else {
      console.log('❌ Unsupported file format:', fileExtension);
      return res.status(400).json({ error: 'Unsupported file format. Use CSV or JSON.' });
    }

    console.log('✅ Data parsed successfully. Rows:', data.length);

    // Limit to first 200 rows
    const limitedData = data.slice(0, 200);
    console.log('📊 Limited to first 200 rows:', limitedData.length);

    const uploadId = await saveUpload({
      data: limitedData,
      country,
      erp,
      rowsParsed: limitedData.length
    });

    console.log('💾 Upload saved with ID:', uploadId);

    return res.json({
      uploadId,
      rowsParsed: limitedData.length,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('💥 Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};