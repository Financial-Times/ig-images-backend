// @flow

import { promisify } from 'bluebird';
import { S3 } from 'aws-sdk';
import { authenticate } from './lib/okta';
import type { LambdaCall } from './types';

const { IMAGE_BUCKET, OBJECT_PREFIX } = process.env;
if (typeof IMAGE_BUCKET !== 'string' || typeof OBJECT_PREFIX !== 'string') {
  throw new Error('Env vars required: IMAGE_BUCKET, OBJECT_PREFIX');
}

const extensions = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

const validContentTypes = new Set(Object.keys(extensions));

const headers = {
  'Access-Control-Allow-Origin': '*',
};

const getUploadUrl = async (event: LambdaCall) => {
  const authenticated = await authenticate(event);

  if (!authenticated) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        message: 'Invalid credentials',
      }),
    };
  }

  const query = event.queryStringParameters;

  // complain if no query string
  if (!query) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Need query parameters',
      }),
    };
  }

  // complain if 'type' param is wrong
  if (!validContentTypes.has(query.type)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: `Need 'type' query param set to one of: ${[...validContentTypes].join(', ')}`,
      }),
    };
  }

  // build a presigned upload URL
  const name = `${10000000000 - Math.round(Date.now() / 1000)}-${Math.random().toString(36).substr(2, 5)}.${extensions[query.type]}`;

  const s3Params = {
    Bucket: IMAGE_BUCKET,
    Key: `${OBJECT_PREFIX}${name}`,
    Expires: 600, // the signed upload link lasts up to 10 minutes
    ContentType: query.type,
    CacheControl: 'public, max-age=31536000', // TODO find out why this doesn't work
    ACL: 'public-read',
  };

  const s3 = new S3();
  const getSignedUrl = promisify(s3.getSignedUrl, { context: s3 });

  const url = await getSignedUrl('putObject', s3Params);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      url,
      name,
    }),
  };
};

export default getUploadUrl;
