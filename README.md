# GCP_WATERGUARD


The code that defines the Cloud Function that is triggered by a write event in a specific Firebase Realtime Database , then processes the data from the write event and synchronizes it with a BigQuery table can be found in the (functions/index.js). Currently, Google Cloud Functions deployed through Firebase can only be executed in a local development environment. The deployment process facilitates the hosting and scaling of functions on the cloud, but the actual execution is limited to local testing environments during development. It's important to note that for production scenarios, the functions are intended to be triggered and run on the Google Cloud Platform.
