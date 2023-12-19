# Shottr Handler (AWS)

This is a quick SST-based project to handle uploads from Shottr to our own buckets.

Note/warning: the feature isn't officially supported in Shottr, so an app update may break compatibility with this API.

## Development

Do the usual bootstrappin':

```
git clone ...
yarn
```

Then just run:

```
yarn dev
```

You'll need a valid upload token (or multiple tokens), so set that with:

```
yarn sst secrets --stage dev set UPLOAD_TOKENS [token1],[token2],[etc] # I use `uuidgen` to generate this
```

Then test the deployment with cURL via:

```
curl -vvv -F token=[token] -F "file=@/path/to/some/image.png" https://domain-generated-by-sst/upload
```

## Deployment

Running in production is pretty much the same as above, but we can configure some options:

```
# .env
API_DOMAIN=api.some-domain.com
S3_BUCKET=some-s3-bucket-you-already-created
CDN_DOMAIN=images.some-domain.com
CDN_ZONE=some-domain.com       # used by route 53
```

Then run `yarn deploy:prod`, and you should hopefully be in business.

## TODO

- add metadata key/value for original filename
