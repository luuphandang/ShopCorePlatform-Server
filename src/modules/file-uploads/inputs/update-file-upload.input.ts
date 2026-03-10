import { InputType, PartialType } from '@nestjs/graphql';

import { CreateFileUploadInput } from './create-file-upload.input';

@InputType()
export class UpdateFileUploadInput extends PartialType(CreateFileUploadInput) {}
