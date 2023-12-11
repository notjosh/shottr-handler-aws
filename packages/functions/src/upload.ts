import { ApiHandler } from 'sst/node/api';
import { Config } from 'sst/node/config';
import { parse } from 'partparse';
import { Bucket } from 'sst/node/bucket';
import crypto from 'crypto';
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

// we expect a multipart post with:
// - token: (string)
// - file: (binary)
// (- uid: string, but unknown)
// (- vc: string of numbers, but unknown)

const filenameWithRandomSuffix = (filename: string) => {
  const randomString = crypto.randomBytes(4).toString('hex');
  const ext = filename.split('.').pop();
  const name = ext != null ? filename.slice(0, -ext.length - 1) : filename;
  const obfuscated = `${name}-${randomString}`;
  const newFilename = ext != null ? obfuscated + '.' + ext : obfuscated;
  return newFilename;
};

const uniqueFilenameForBucket = async (
  filename: string,
  bucketName: string,
  attemptsRemaining = 3,
): Promise<string> => {
  if (attemptsRemaining === 0) {
    throw new Error('Could not generate a unique filename');
  }

  const newFilename = filenameWithRandomSuffix(filename);

  const client = new S3Client({});
  const command = new HeadObjectCommand({
    Bucket: bucketName,
    Key: newFilename,
  });

  try {
    await client.send(command);

    // file exists, try again
    return uniqueFilenameForBucket(filename, bucketName, attemptsRemaining - 1);
  } catch (err) {
    // file does not exist, return newFilename
    return newFilename;
  }
};

export const create = ApiHandler(async (evt) => {
  try {
    const form = await parse(evt);

    const { token, files } = form;
    const file = files.find((f) => f.fieldname === 'file');

    // validate values
    if (token == null) {
      return {
        statusCode: 400,
        body: 'ERR: Missing `token`',
      };
    }

    if (file == null) {
      return {
        statusCode: 400,
        body: 'ERR: Missing `file`',
      };
    }

    // check token against known tokens
    const validTokens = Config.UPLOAD_TOKENS.split(',');
    if (!validTokens.includes(token)) {
      return {
        statusCode: 403,
        body: 'ERR: Invalid token',
      };
    }

    // validate file is an image
    const isImage = file.contentType.startsWith('image/');
    if (!isImage) {
      return {
        statusCode: 400,
        body: 'ERR: Invalid file type',
      };
    }

    // create an obfuscated filename, and ensure it is unique
    const newFilename = await uniqueFilenameForBucket(
      file.filename,
      Bucket.public.bucketName,
    );

    // upload file to s3, and make public
    console.log(
      `Uploading ${file.filename} to ${Bucket.public.bucketName} as ${newFilename}...`,
    );

    const client = new S3Client({});
    const command = new PutObjectCommand({
      Bucket: Bucket.public.bucketName,
      Key: newFilename,
      Body: file.content,
      ContentType: file.contentType,
      ContentEncoding: file.encoding,
      ACL: 'public-read',
    });

    await client.send(command);

    // return the url to the file
    return {
      statusCode: 200,
      body: `SUCCESS: https://${Bucket.public.bucketName}.s3.amazonaws.com/${newFilename}`,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `ERR: Application error: ${
        typeof err === 'object' && err != null && 'message' in err
          ? err.message
          : err
      }`,
    };
  }
});
