# ig-images-backend [![CircleCI](https://circleci.com/gh/Financial-Times/ig-images-backend.svg?style=svg)](https://circleci.com/gh/Financial-Times/ig-images-backend)

See also [ig-images-frontend](https://github.com/Financial-Times/ig-images-frontend).

## Deploying to AWS Lambda

- Create access keys in the AWS console for the `FTDeployUserFor_ig-images` user and put them in the CircleCI env vars as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
- Pushing the `main` branch should deploy to AWS dev and prod.
