# 🌟 Guide to Configuring Your `.env` File for AWS S3 Integration

This guide walks you through setting up your `.env` file to enable seamless file uploads and serving from **AWS S3**. Follow these steps to configure the required environment variables with clarity and precision.

---

## 📋 Prerequisites

- An **AWS account** with access to the AWS Management Console.
- A basic understanding of **AWS S3** and **IAM** services.
- A `.env` file in your project root (create one if it doesn't exist).

---

## 🔑 Step-by-Step Configuration

### 1. AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY

These credentials allow your application to authenticate with AWS services.

#### How to Get Them:

1. Log in to your **AWS Management Console**.
2. Navigate to **IAM** (Identity and Access Management) → **Users**.
3. Create a new user or select an existing one.
4. Under **Permissions**, attach a policy (e.g., `AmazonS3FullAccess` or a custom policy with S3 upload rights).
5. Go to the user’s **Security credentials** tab and click **Create access key**.
6. Copy the **Access Key ID** and **Secret Access Key** displayed.

#### Add to `.env`:

```plaintext
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

> **⚠️ Security Tip**: Never share or commit your `.env` file to version control. Add it to `.gitignore`!

---

### 2. AWS_REGION

This specifies the AWS region where your S3 bucket is hosted.

#### How to Find It:

- Check the region when creating your S3 bucket or view it in the bucket’s **Properties** tab in the AWS Console.
- Common regions include:
  - `us-east-1` (N. Virginia)
  - `eu-west-1` (Ireland)
  - `ap-south-1` (Mumbai)

#### Add to `.env`:

```plaintext
AWS_REGION=your_region
```

#### Example:

```plaintext
AWS_REGION=us-east-1
```

---

### 3. AWS_S3_BUCKET

This is the name of your S3 bucket, which must be **globally unique** across all AWS accounts.

#### How to Set It:

- Choose a descriptive, unique name when creating your bucket in the AWS Console.
- Verify the bucket name in the S3 dashboard.

#### Add to `.env`:

```plaintext
AWS_S3_BUCKET=your_bucket_name
```

#### Example:

```plaintext
AWS_S3_BUCKET=my-fastapi-pdf-bucket
```

> **💡 Tip**: Use lowercase letters, numbers, and hyphens for bucket names to avoid errors.

---

### 4. AWS_S3_BUCKET_URL (Optional)

This is the base URL for accessing files in your S3 bucket. While optional, it’s useful for serving files directly.

#### Format:

```
https://<your-bucket-name>.s3.<your-region>.amazonaws.com
```

#### How to Set It:

- Replace `<your-bucket-name>` with your bucket’s name.
- Replace `<your-region>` with the region from Step 2.

#### Add to `.env`:

```plaintext
AWS_S3_BUCKET_URL=your_bucket_url
```

#### Example:

```plaintext
AWS_S3_BUCKET_URL=https://my-fastapi-pdf-bucket.s3.us-east-1.amazonaws.com
```

---

## ✅ Final `.env` Example

Here’s how your `.env` file might look after configuration:

```plaintext
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=my-fastapi-pdf-bucket
AWS_S3_BUCKET_URL=https://my-fastapi-pdf-bucket.s3.us-east-1.amazonaws.com
```

---

## 🚀 Ready to Go!

With these variables set, your application is now configured to **upload** and **serve files** from your AWS S3 bucket. Test your setup to ensure everything works as expected.
