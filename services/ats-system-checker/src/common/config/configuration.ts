export default () => ({
  //? =========== Backend Configuration ===========
  NATS_URL: process.env.NATS_URL,
  // NATS_USER: process.env.NATS_USER,
  // NATS_PASSWORD: process.env.NATS_PASSWORD,
  NODE_ENV: process.env.NODE_ENV,

  //* Database configuration (MongoDB),
  MONGO_URI_REMOTE: process.env.MONGO_URI_REMOTE,
  MONGO_URI_LOCAL: process.env.MONGO_URI_LOCAL,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,

  //! =========== Authentication Layer ===========
  //? AWS S3 Configuration
  AWS_REGION: process.env.AWS_S3_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_S3_BUCKET_URL: process.env.AWS_S3_BUCKET_URL,
  UPLOADS_BASE_URL: process.env.UPLOADS_BASE_URL,
});
