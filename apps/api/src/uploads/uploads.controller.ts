import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_IMAGE_SIZE_BYTES,
      },
      fileFilter: (_request, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Only image files are allowed'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadProductImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const result = await this.cloudinaryService.uploadProductImage(file);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }
}
