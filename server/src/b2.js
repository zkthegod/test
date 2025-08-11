import B2 from 'backblaze-b2';

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

let authorized = false;

export async function ensureAuth(){
  if (!authorized){
    await b2.authorize();
    authorized = true;
  }
}

export async function uploadToB2(fileBuffer, fileName, mimeType){
  await ensureAuth();
  await b2.authorize();
  const bucketId = process.env.B2_BUCKET_ID;
  const { data: up } = await b2.getUploadUrl({ bucketId });
  const sha1 = require('crypto').createHash('sha1').update(fileBuffer).digest('hex');
  await b2.uploadFile({
    uploadUrl: up.uploadUrl,
    uploadAuthToken: up.authorizationToken,
    fileName,
    data: fileBuffer,
    mime: mimeType,
    hash: sha1,
  });
  const base = process.env.B2_BASE_URL?.replace(/\/$/, '') || '';
  const url = `${base}/file/${process.env.B2_BUCKET_NAME}/${encodeURIComponent(fileName)}`;
  return url;
}