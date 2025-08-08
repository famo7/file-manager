const prisma = require('../prismaClient');
const supabase = require('../utils/supabaseClient');
const axios = require('axios');
exports.uploadFile = async (req, res) => {
  try {
    const folderId = parseInt(req.body.folderId);
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;

    const { data, error } = await supabase.storage
      .from('fileuploade')
      .upload(fileName, req.file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: req.file.mimetype,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).send('File upload failed with Supabase error.');
    }

    await prisma.file.create({
      data: {
        path: data.path,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        folderId: folderId,
        userId: req.user.id,
      },
    });

    res.redirect(`/folders/${folderId}`);
  } catch (err) {
    console.error('File upload failed:', err);
    res.status(500).send('File upload failed due to a server error.');
  }
};

exports.getFileById = async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send('File not found');
    }

    const { data, error } = await supabase.storage
      .from('fileuploade')
      .createSignedUrl(file.path, 60);

    if (error || !data) {
      console.error('Supabase signed URL error:', error);
      return res.status(500).send('Failed to generate file preview URL');
    }

    res.render('files/show', {
      file,
      signedUrl: data.signedUrl,
    });
  } catch (error) {
    console.error('getFileById error:', error);
    res.status(500).send('Server error');
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send('File not found');
    }

    const { error: storageError } = await supabase.storage
      .from('fileuploade')
      .remove([file.path]);

    if (storageError) {
      console.error('Error deleting from Supabase:', storageError);
      return res.status(500).send('Failed to delete file from storage');
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    res.redirect('/folders/' + file.folderId);
  } catch (error) {
    console.error('deleteFile error:', error);
    res.status(500).send('Server error');
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).send('File not found');
    }

    const { data, error } = await supabase.storage
      .from('fileuploade')
      .createSignedUrl(file.path, 60);

    if (error || !data) {
      console.error('Signed URL error:', error);
      return res.status(500).send('Failed to generate download URL');
    }

    const response = await axios.get(data.signedUrl, {
      responseType: 'stream',
    });

    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', file.type);

    response.data.pipe(res);
  } catch (error) {
    console.error('downloadFile error:', error);
    res.status(500).send('Server error');
  }
};
