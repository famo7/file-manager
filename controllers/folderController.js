const prisma = require('../prismaClient');
const supabase = require('../utils/supabaseClient');

exports.getAllFolders = async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
    },
  });
  res.render('folders/index', {
    title: 'All Folders',
    folders,
  });
};

exports.getNewFolderForm = (req, res) => {
  res.render('folders/new');
};

exports.createFolder = async (req, res) => {
  await prisma.folder.create({
    data: {
      name: req.body.name,
      userId: req.user.id,
    },
  });
  res.redirect('/folders');
};

exports.getFolderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        files: true,
      },
    });

    if (!folder) {
      return res.status(404).send('Folder not found');
    }

    const filesWithSignedUrls = await Promise.all(
      folder.files.map(async (file) => {
        const { data, error } = await supabase.storage
          .from('fileuploade')
          .createSignedUrl(file.path, 60);

        if (error || !data) {
          console.error('Supabase signed URL error:', error);
          return { ...file, signedUrl: null };
        }

        return { ...file, signedUrl: data.signedUrl };
      })
    );
    console.log(filesWithSignedUrls);

    res.render('folders/show', {
      folder: folder,
      files: filesWithSignedUrls,
    });
  } catch (error) {
    console.error('getFolderById error:', error);
    res.status(500).send('Server error');
  }
};

exports.getEditFolderForm = async (req, res) => {
  const folder = await prisma.folder.findFirst({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id,
    },
  });
  if (folder) {
    res.render('folders/edit', {
      folder: folder,
    });
  } else {
    res.status(404).send('Folder not found');
  }
};

exports.updateFolder = async (req, res) => {
  const folder = await prisma.folder.findFirst({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id,
    },
  });

  if (!folder) {
    return res.status(404).send('Folder not found');
  }

  await prisma.folder.update({
    where: { id: folder.id },
    data: { name: req.body.name },
  });

  res.redirect(`/folders/${folder.id}`);
};

exports.deleteFolder = async (req, res) => {
  const folder = await prisma.folder.findFirst({
    where: {
      id: parseInt(req.params.id),
      userId: req.user.id,
    },
  });

  if (!folder) {
    return res.status(404).send('Folder not found');
  }

  await prisma.folder.delete({
    where: { id: folder.id },
  });

  res.redirect('/folders');
};
