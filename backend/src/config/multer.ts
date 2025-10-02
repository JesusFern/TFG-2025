import multer from 'multer';
import { createMulterStorage, imageFileFilter, commonLimits } from './multerCommon';

const upload = multer({
  storage: createMulterStorage('recipes'),
  fileFilter: imageFileFilter,
  limits: commonLimits
});

export default upload;
