// @flow

import { S3 } from 'aws-sdk';
import { promisify } from 'bluebird';
import { authenticate } from './lib/s3o';

import type { Response } from './types';

const { IMAGE_BUCKET, OBJECT_PREFIX } = process.env;

if (typeof IMAGE_BUCKET !== 'string' || typeof OBJECT_PREFIX !== 'string') {
  throw new Error('Env vars required: IMAGE_BUCKET, OBJECT_PREFIX');
}

const headers = {
  'Access-Control-Allow-Origin': '*',
};

export default async (
  event: Event & { queryStringParameters: { [string]: string } },
): Promise<Response> => {
  const authenticated = await authenticate(event.queryStringParameters);

  if (authenticated !== true) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        message: 'Invalid credentials',
      }),
    };
  }

  const params = {
    Bucket: IMAGE_BUCKET,
    Prefix: OBJECT_PREFIX,
    MaxKeys: 100,
  };

  const s3 = new S3();
  const listObjects = promisify(s3.listObjects, { context: s3 });

  const data = await listObjects(params);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      prefix: `https://${IMAGE_BUCKET}.s3.eu-west-1.amazonaws.com/${OBJECT_PREFIX}`,

      images: data.Contents
        .filter(item => item.Size > 0)
        .map(item => item.Key.substring(3)),
    }),
  };
};
